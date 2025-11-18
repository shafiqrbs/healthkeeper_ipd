import { useNavigate, useOutletContext } from "react-router-dom";
import {
	IconArrowNarrowRight,
	IconChevronUp,
	IconSelector,
	IconDotsVertical,
	IconPrinter,
	IconFileText,
	IconCalendarWeek,
	IconUser,
} from "@tabler/icons-react";
import {
	Box,
	Flex,
	Text,
	ActionIcon,
	Group,
	Button,
	SegmentedControl,
	Menu,
	rem,
	ScrollArea,
	Grid,
	LoadingOverlay,
} from "@mantine/core";
import { HOSPITAL_DATA_ROUTES } from "@/constants/routes";
import { MODULES } from "@/constants";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "@utils/index";
import useInfiniteTableScroll from "@hooks/useInfiniteTableScroll";
import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";
import { showEntityData } from "@/app/store/core/crudThunk";
import { showNotificationComponent } from "@components/core-component/showNotificationComponent";
import KeywordSearch from "@hospital-components/KeywordSearch";
import { DataTable } from "mantine-datatable";
import tableCss from "@assets/css/Table.module.css";
import DataTableFooter from "@components/tables/DataTableFooter";
import IPDPrescriptionFullBN from "@hospital-components/print-formats/ipd/IPDPrescriptionFullBN";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { getDataWithoutStore } from "@/services/apiService";
import DetailsInvoiceBN from "@hospital-components/print-formats/billing/DetailsInvoiceBN";
import DischargeA4BN from "@hospital-components/print-formats/discharge/DischargeA4BN";
import { modals } from "@mantine/modals";
import { useDisclosure } from "@mantine/hooks";
import IpdManageDrawer from "@hospital-components/drawer/IpdManageDrawer";
import AdmissionFormBN from "@hospital-components/print-formats/admission/AdmissionFormBN";

const module = MODULES.ADMISSION;
const PER_PAGE = 500;

export default function _Table({ setSelectedPrescriptionId, ipdMode, setIpdMode }) {
	const dischargePaperRef = useRef(null);
	const admissionFormRef = useRef(null);
	const prescriptionRef = useRef(null);
	const billingInvoiceRef = useRef(null);
	const { t } = useTranslation();
	const { mainAreaHeight } = useOutletContext();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const filterData = useSelector((state) => state.crud[module].filterData);
	const [printData, setPrintData] = useState(null);
	const [billingPrintData, setBillingPrintData] = useState(null);
	const [dischargePaperPrintData, setDischargePaperPrintData] = useState(null);
	const [admissionFormPrintData, setAdmissionFormPrintData] = useState(null);
	const height = mainAreaHeight - 100;
	const [openedManageIpd, { open: openManageIpd, close: closeManageIpd }] = useDisclosure(false);
	const form = useForm({
		initialValues: {
			keywordSearch: "",
			created: formatDate(new Date()),
		},
	});

	const { records, fetching, sortStatus, setSortStatus, handleScrollToBottom, scrollRef } = useInfiniteTableScroll({
		module,
		fetchUrl: HOSPITAL_DATA_ROUTES.API_ROUTES.IPD.INDEX,
		filterParams: {
			name: filterData?.name,
			patient_mode: "ipd",
			term: form.values.keywordSearch,
			prescription_mode: ipdMode,
			created: form.values.created,
		},
		perPage: PER_PAGE,
		sortByKey: "created_at",
		direction: "desc",
	});

	const printPrescription = useReactToPrint({
		content: () => prescriptionRef.current,
	});

	const printBillingInvoice = useReactToPrint({
		content: () => billingInvoiceRef.current,
	});

	const printDischargePaper = useReactToPrint({
		content: () => dischargePaperRef.current,
	});

	const printAdmissionForm = useReactToPrint({
		content: () => admissionFormRef.current,
	});

	const handleDischargePaperPrint = async (id) => {
		const res = await getDataWithoutStore({
			url: `${HOSPITAL_DATA_ROUTES.API_ROUTES.IPD.INDEX}/${id}`,
		});
		setDischargePaperPrintData(res.data);
		requestAnimationFrame(printDischargePaper);
	};

	const handleBillingInvoicePrint = async (id) => {
		const res = await getDataWithoutStore({
			url: `${HOSPITAL_DATA_ROUTES.API_ROUTES.IPD.INDEX}/${id}`,
		});
		setBillingPrintData(res.data);
		requestAnimationFrame(printBillingInvoice);
	};

	const handlePrescriptionPrint = async (id) => {
		const res = await getDataWithoutStore({
			url: `${HOSPITAL_DATA_ROUTES.API_ROUTES.IPD.INDEX}/${id}`,
		});
		setPrintData(res.data);
		requestAnimationFrame(printPrescription);
	};

	const handleManageOverview = (prescriptionId, id) => {
		setSelectedPrescriptionId(prescriptionId);
		navigate(`${HOSPITAL_DATA_ROUTES.NAVIGATION_LINKS.IPD_ADMITTED.MANAGE}/${prescriptionId}`);
	};

	const handleChangeIpdMode = () => {
		navigate(HOSPITAL_DATA_ROUTES.NAVIGATION_LINKS.IPD_ADMITTED.INDEX);
	};

	const handleAdmissionFormPrint = async (id) => {
		const res = await getDataWithoutStore({
			url: `${HOSPITAL_DATA_ROUTES.API_ROUTES.IPD.INDEX}/${id}`,
		});
		setAdmissionFormPrintData(res.data);
		requestAnimationFrame(printAdmissionForm);
	};

	const handleProcessConfirmation = async (id, uid) => {
		const resultAction = await dispatch(
			showEntityData({
				url: `${HOSPITAL_DATA_ROUTES.API_ROUTES.PRESCRIPTION.SEND_TO_PRESCRIPTION}/${id}`,
				module,
				id,
			})
		).unwrap();
		const prescription_id = resultAction?.data?.data.uid;
		if (prescription_id) {
			navigate(
				`${HOSPITAL_DATA_ROUTES.NAVIGATION_LINKS.IPD_ADMITTED.IPD_PRESCRIPTION}/${prescription_id}?redirect=prescription&ipd=${uid}`
			);
		} else {
			console.error(resultAction);
			showNotificationComponent(t("SomethingWentWrongPleaseTryAgain"), "red.6", "lightgray");
		}
	};

	return (
		<Box pos="relative">
			<Flex align="center" justify="space-between">
				<KeywordSearch form={form} module={module} />
			</Flex>
			<Box className="borderRadiusAll border-top-none" pos="relative">
				<LoadingOverlay visible={fetching} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
				<Box>
					<Flex gap="sm" p="les" c="white" bg="var(--theme-primary-color-6)" mt="3xs">
						<Text ta="center" fz="sm" fw={500}>
							S/N
						</Text>
						<Text ta="center" fz="sm" fw={500}>
							Patient Name
						</Text>
					</Flex>
					<ScrollArea bg="white" h={mainAreaHeight - 150} scrollbars="y" px="3xs">
						{records?.map((item, index) => (
							<Grid
								columns={12}
								key={item.id}
								my="xs"
								bg={index % 2 === 0 ? "var(--theme-primary-color-0)" : "var(--theme-tertiary-color-0)"}
								px="xs"
								gutter="xs"
							>
								<Grid.Col span={3}>
									<Flex align="center" gap="3xs">
										<IconCalendarWeek size={16} stroke={1.5} />

										<Text fz="sm" className="activate-link text-nowrap">
											{formatDate(item?.created_at)}
										</Text>
									</Flex>
									<Flex align="center" gap="3xs">
										<IconUser size={16} stroke={1.5} />
										<Text fz="sm">{item.patient_id}</Text>
									</Flex>
								</Grid.Col>
								<Grid.Col span={3}>
									<Box>
										<Text fz="sm">{item.name}</Text>
										<Text fz="sm">{item.room_name || "N/A"}</Text>
									</Box>
								</Grid.Col>
								<Grid.Col span={5}>
									<Box>
										<Text fz="sm">
											Days: {item.admission_day ?? 0}, Consumed: {item.consume_day ?? 0}, Remains:{" "}
											{item.remaining_day ?? 0}
										</Text>
										<Text fz="sm">
											Total: {item.total ?? 0}, Amount: {item.amount ?? 0}, Due:{" "}
											{item.total ?? 0 - item.amount ?? 0}
										</Text>
									</Box>
								</Grid.Col>
								<Grid.Col span={1} ta="right">
									<ActionIcon
										variant="filled"
										onClick={() => handleManageOverview(item.uid, item.id)}
										color="var(--theme-primary-color-6)"
										radius="xs"
										aria-label="Settings"
										mt="les"
									>
										<IconArrowNarrowRight style={{ width: "70%", height: "70%" }} stroke={1.5} />
									</ActionIcon>
								</Grid.Col>
							</Grid>
						))}
					</ScrollArea>
				</Box>
			</Box>
			<DataTableFooter indexData={records} module="ipd" />

			<IpdManageDrawer opened={openedManageIpd} close={closeManageIpd} />

			{admissionFormPrintData && <AdmissionFormBN data={admissionFormPrintData} ref={admissionFormRef} />}
			{printData && <IPDPrescriptionFullBN data={printData} ref={prescriptionRef} />}
			{billingPrintData && <DetailsInvoiceBN data={billingPrintData} ref={billingInvoiceRef} />}
			{dischargePaperPrintData && <DischargeA4BN data={dischargePaperPrintData} ref={dischargePaperRef} />}
		</Box>
	);
}
