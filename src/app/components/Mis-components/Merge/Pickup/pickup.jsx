import React, { useState, useEffect, useMemo, useRef } from 'react'
import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import { styled } from '@mui/system'
import { useNavigate } from 'react-router-dom'
import {
    axiosMisUser,
    axiosSuperAdminPrexo,
    axiosWarehouseIn,
} from '../../../../../axios'
import Tab from '@mui/material/Tab'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import Swal from 'sweetalert2'
import AssignToSorting from './assign-to-user'
import jwt_decode from 'jwt-decode'
import moment from 'moment'
import {
    Box,
    Card,
    Typography,
    Table,
    TableContainer,
    TextField,
    Button,
    MenuItem,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
} from '@mui/material'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
}

const ScrollableTableContainer = styled(TableContainer)`
    overflow-x: auto;
`

const Container = styled('div')(({ theme }) => ({
    margin: '30px',

    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: {
            marginBottom: '16px',
        },
    },
}))

const ProductTable = styled(Table)(() => ({
    width: '150%',
    height: '100%',
    whiteSpace: 'none',
    '& thead': {
        '& th:first-of-type': {
            paddingLeft: 16,
        },
    },
    '& td': {
        borderBottom: '1px solid #ddd',
    },
    '& td:first-of-type': {
        paddingLeft: '16px !important',
    },
}))

const ProductTableTwo = styled(Table)(() => ({
    minWidth: 750,
    width: '187%',
    height: '100%',
    whiteSpace: 'none',
    '& thead': {
        '& th:first-of-type': {
            paddingLeft: 16,
        },
    },
    '& td': {
        borderBottom: '1px solid #ddd',
    },
    '& td:first-of-type': {
        paddingLeft: '16px !important',
    },
}))

const ProductTableThere = styled(Table)(() => ({
    minWidth: 750,
    width: '212%',
    height: '100%',
    whiteSpace: 'none',
    '& thead': {
        '& th:first-of-type': {
            paddingLeft: 16,
        },
    },
    '& td': {
        borderBottom: '1px solid #ddd',
    },
    '& td:first-of-type': {
        paddingLeft: '16px !important',
    },
}))
const ProductTableRdlOne = styled(Table)(() => ({
    minWidth: 750,
    width: '240%',
    height: '100%',
    whiteSpace: 'none',
    '& thead': {
        '& th:first-of-type': {
            paddingLeft: 16,
        },
    },
    '& td': {
        borderBottom: '1px solid #ddd',
    },
    '& td:first-of-type': {
        paddingLeft: '16px !important',
    },
}))
const ProductTableRdlTwo = styled(Table)(() => ({
    minWidth: 750,
    width: '108%',
    height: '100%',
    whiteSpace: 'none',
    '& thead': {
        '& th:first-of-type': {
            paddingLeft: 16,
        },
    },
    '& td': {
        borderBottom: '1px solid #ddd',
    },
    '& td:first-of-type': {
        paddingLeft: '16px !important',
    },
}))

const PickupPage = () => {
    /*-----------------------state----------------------------------*/

    const [value, setValue] = React.useState('Charge Done')
    const [item, setItem] = useState([])
    const [brand, setbrand] = useState([])
    const [model, setModel] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [state, setState] = useState({})
    const [isCheck, setIsCheck] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [location, setLoaction] = useState('')
    const [sortingUsers, SetSortingUsers] = useState([])
    const [whtTray, setWhtTray] = useState([])
    const [selectedStatus, setSelectedStatus] = useState([])

    const [shouldOpenEditorDialog, setShouldOpenEditorDialog] = useState(false)
    const navigate = useNavigate()
    /*--------------------------------------------------------------*/

    const handleChange = (event, newValue) => {
        setIsLoading(true)
        setItem([])
        setIsCheck([])
        setValue(newValue)
        setSelectedStatus([])
    }
    // const valueRef = useRef(value)

    /*---------------------------USEEFFECT-----------------------------------*/
    useEffect(() => {
        const fetchData = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    setIsLoading(true)
                    const { location } = jwt_decode(admin)
                    setLoaction(location)
                    let response = await axiosMisUser.post(
                        '/pickup/items/' + value + '/' + location
                    )
                    if (response.status === 200) {
                        setIsLoading(false)
                        setItem(response.data.data)
                        // if (response.data.type == valueRef.current) {
                        //     console.log("----------------");
                        //     console.log(value);
                        // } else {
                        //     fetchData()
                        // }
                    } else {
                        setItem(response.data.data)
                        setIsLoading(false)
                    }
                } else {
                    navigate('/')
                }
            } catch (error) {
                alert(error)
            }
        }
        fetchData()
    }, [value, refresh])

    useEffect(() => {
        const FetchModel = async () => {
            let res = await axiosSuperAdminPrexo.post('/getBrands')
            if (res.status == 200) {
                setbrand(res.data.data)
            }
        }
        FetchModel()
    }, [])

    /*--------------------------------------------------------------*/
    const handleClick = (e) => {
        const { id, checked } = e.target
        setIsCheck([...isCheck, id])
        if (!checked) {
            setIsCheck(isCheck.filter((item) => item !== id))
        }
    }
    /*-----------------FETCH MODEL BASED ON THE BRAND---------------*/
    /* Fetch model */
    const fetchModel = async (brandName) => {
        try {
            let res = await axiosSuperAdminPrexo.post(
                '/get-product-model/' + brandName
            )
            if (res.status == 200) {
                setModel(res.data.data)
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
            })
        }
    }
    // SEE ALL
    const fetchAll = async (e) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            let response = await axiosMisUser.post(
                '/pickup/seeAll/' + value + '/' + location
            )
            if (response.status === 200) {
                setIsLoading(false)
                setItem(response.data.data)
            } else {
                setItem(response.data.data)
                setIsLoading(false)
            }
        } catch (error) {
            alert(error)
        }
    }

    /*---------------------STATE CHANGE FOR SORT----------------------*/
    const handleChangeSort = ({ target: { name, value } }) => {
        setState({
            ...state,
            [name]: value,
        })
    }

    const handleDialogClose = () => {
        setIsCheck([])
        SetSortingUsers([])
        setShouldOpenEditorDialog(false)
    }

    const handleDialogOpen = () => {
        setShouldOpenEditorDialog(true)
    }

    const handleChangeDate = ({ target: { value } }) => {
        console.log(value)
        setSelectedStatus(typeof value === 'string' ? value.split(',') : value)
    }
    const dataFilter = async () => {
        try {
            let obj = {
                selectedStatus: selectedStatus,
                location: location,
                type: value,
            }

            setIsLoading(true)
            const res = await axiosMisUser.post('/pickup/dateFilter', obj)
            if (res.status === 200) {
                setIsLoading(false)
                setItem(res.data.data)
            } else {
                setIsLoading(false)
                setItem(res.data.data)
            }
        } catch (error) {
            alert(error)
        }
    }

    /*---------------------HANDEL SORT-------------------------------*/

    const handelSort = async () => {
        try {
            const admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                const { location } = jwt_decode(admin)
                setIsCheck([])
                setIsLoading(true)
                let obj = {
                    brand: state?.brand,
                    model: state?.model,
                    location: location,
                    type: value,
                }
                const res = await axiosMisUser.post('/pickup/sortItem', obj)
                if (res.status == 200) {
                    setIsLoading(false)
                    setItem(res.data.data)
                } else {
                    setItem(res.data.data)
                    setIsLoading(false)
                }
            }
        } catch (error) {
            alert(error)
        }
    }

    const handelSortingAgent = async () => {
        try {
            let token = localStorage.getItem('prexo-authentication')
            if (token) {
                const { location } = jwt_decode(token)

                let sortingUsers = await axiosMisUser.post(
                    '/getSortingAgentMergeMmt/' + location
                )

                if (sortingUsers.status == 200) {
                    SetSortingUsers(sortingUsers.data.data)
                }
                let obj = {
                    isCheck: isCheck,
                    type: value,
                }
                let whtTray = await axiosMisUser.post('/pickup/whtTray', obj)
                if (whtTray.status == 200) {
                    setWhtTray(whtTray.data.data)
                    handleDialogOpen()
                } else {
                    alert(whtTray.data.message)
                }
            }
        } catch (error) {
            alert(error)
        }
    }

    const columnsOne = [
        {
            name: 'items',
            label: (
                <Typography noWrap
                    variant="subtitle1"
                    fontWeight="bold"
                    // sx={{ marginLeft: '7px' }}
                >
                    <>Select</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, dataIndex) => {
                    return (
                        <Checkbox
                            onClick={(e) => {
                                handleClick(e)
                            }}
                            id={value.uic}
                            key={value.uic}
                            checked={isCheck.includes(value.uic)}
                        />
                    )
                },
            },
        },
        {
            name: 'index',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Record No</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography noWrap sx={{ pl: 4 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },

        {
            name: 'items', // field name in the row object
            label: (
                <Typography noWrap
                    variant="subtitle1"
                    fontWeight="bold"
                >
                    <>UIC</>
                </Typography>
            ), // column title that will be shown in table

            options: {
                sort: true,
                filter: true,
                maxWidth: 6,
                minWidth: 4,
                customBodyRender: (value, dataIndex) => value.uic
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Order ID</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) => value.order_id,
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>IMEI</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) => value.imei || '',
            },
        },

        {
            name: 'brand',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Brand</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true
            },
        },
        {
            name: 'model',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Model</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>MUIC</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) => value.muic || '',
            },
        },
        {
            name: 'code',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Tray ID</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value) => (
                    <Typography>
                      {value} {/* Apply the desired alignment, 'center' in this case */}
                    </Typography>
                  ),
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Battery Status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.battery_status || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Charge Percentage</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.charge_percentage || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Body Condition</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.body_condition || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Display Condition</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) => {
                    const displayCondition = value?.charging?.display_condition
                    if (!displayCondition) {
                        // check if displayCondition is empty or null
                        return null // return null to prevent the checkbox from showing
                    } else {
                        return displayCondition // return the display condition value
                    }
                },
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Lock Status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.lock_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Charging Jack</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.charging_jack_type || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Body Part Missing</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.boady_part_missing || ''
            },
        },
    ]
    const columnsTwo = [
        {
            name: 'items',
            label: (
                <Typography noWrap
                    variant="subtitle1"
                    fontWeight="bold"
                >
                    <>Select</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, dataIndex) => {
                    return (
                        <Checkbox
                            onClick={(e) => {
                                handleClick(e)
                            }}
                            id={value.uic}
                            key={value.uic}
                            checked={isCheck.includes(value.uic)}
                        />
                    )
                },
            },
        },
        {
            name: 'index',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" marginLeft='5px'>
                    <>Record No</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography noWrap sx={{ pl: 7 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },

        {
            name: 'items', // field name in the row object
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold"  >
                    <>UIC</>
                </Typography>
            ), // column title that will be shown in table
            options: {
                filter: true,
                sort:true,
                customBodyRender: (value, dataIndex) => value.uic || ''
                    
            },
            
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Order ID</>
                </Typography>
            ),
            options: {
                filter: true,
                sort:true,
                customBodyRender: (value, dataIndex) => value.order_id || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>IMEI</>
                </Typography>
            ),
            options: {
                filter: true,
                sort:true,
                customBodyRender: (value, dataIndex) => value.imei || '',
            },
        },

        {
            name: 'brand',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Brand</>
                </Typography>
            ),
            options: {
                filter: true,
                sort:true,
            },
        },
        {
            name: 'model',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Model</>
                </Typography>
            ),
            options: {
                filter: true,
                sort:true,
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>MUIC</>
                </Typography>
            ),
            options: {
                filter: true,
                sort:true,
                customBodyRender: (value, dataIndex) => value.muic || '',
            },
        },
        {
            name: 'code',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Tray ID</>
                </Typography>
            ),
            options: {
                filter: true,
                sort:true,
                customBodyRender: (value) => (
                    <Typography sx={{ ml:1 }}>
                      {value} {/* Apply the desired alignment, 'center' in this case */}
                    </Typography>
                  ),
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Battery Status</>
                </Typography>
            ),
            options: {
                sort:true,
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.battery_status || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Charge Percentage</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.charge_percentage || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Body Condition</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.body_condition || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Display Condition</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.display_condition || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Lock Status</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.lock_status || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Charging Jack</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.charging_jack_type || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Body Missing Part</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.charging?.boady_part_missing || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Blanco QC Status</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.bqc_report?.blancoo_qc_status || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>Factory Reset Status</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.factory_reset_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>BQC Incomplete Reason</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.bqc_report?.bqc_incomplete_reason || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Technical Issue</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.bqc_report?.technical_issue || ''
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" >
                    <>BQC User Remark</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>value?.bqc_report?.other || ''
            },
        },
    ]
    const columnsThree = [
        {
            name: 'items',
            label: (
                <Typography noWrap
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ marginLeft: '7px' }}
                >
                    <>Select</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({ style: { width: '100px' } }),
                customBodyRender: (value, dataIndex) => {
                    return (
                        <Checkbox
                            onClick={(e) => {
                                handleClick(e)
                            }}
                            id={value.uic}
                            key={value.uic}
                            checked={isCheck.includes(value.uic)}
                        />
                    )
                },
            },
        },
        {
            name: 'index',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Record No</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography noWrap sx={{ pl: 4 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },

        {
            name: 'items', // field name in the row object
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>UIC</>
                </Typography>
            ), // column title that will be shown in table
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value.uic || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Order ID</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value.order_id || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>IMEI</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value.imei || '',
            },
        },

        {
            name: 'brand',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Brand</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'model',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Model</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>MUIC</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value.muic || '',
            },
        },
        {
            name: 'code',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Tray ID</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Battery Status</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.battery_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Charge Percentage</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.charge_percentage || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Body Condition</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.body_condition || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Display Condition</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.display_condition || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Lock Status</>
                </Typography>
            ),
            options: {
                filter: true,
                setCellProps: () => ({ style: { width: '100px' } }),
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.lock_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Charging Jack</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.charging_jack_type || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Body Missing Part</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.boady_part_missing || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Blanco QC Status</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.blancoo_qc_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Factory Reset Status</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.factory_reset_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>BQC Incomplete Reason</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.bqc_incomplete_reason || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Technical Issue</>
                </Typography>
            ),
            options: {
                filter: true,

                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.technical_issue || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>BQC User Remark</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.other || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Original Grade</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.orgGrade || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Audit Recommend Grade</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.grade || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Stage</>
                </Typography>
            ),
            options: {
                filter: true,

                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.stage || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Reason</>
                </Typography>
            ),
            options: {
                filter: true,
                FileList: (value) => value?.audit_report?.reason,
                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.reason || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Description</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.description || '',
            },
        },
    ]
    const columnsForRdlOne = [
        {
            name: 'items',
            label: (
                <Typography noWrap
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ marginLeft: '7px' }}
                >
                    <>Select</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({ style: { width: '100px' } }),
                customBodyRender: (value, dataIndex) => {
                    return (
                        <Checkbox
                            onClick={(e) => {
                                handleClick(e)
                            }}
                            id={value.uic}
                            key={value.uic}
                            checked={isCheck.includes(value.uic)}
                        />
                    )
                },
            },
        },
        {
            name: 'index',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold" sx={{mr:5}}>
                    <>Record No</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,

                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography noWrap sx={{ pl: 2 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },

        {
            name: 'items', // field name in the row object
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>UIC</>
                </Typography>
            ), // column title that will be shown in table
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) => value.uic || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Order ID</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) => value.order_id || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>IMEI</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) => value.imei || '',
            },
        },

        {
            name: 'brand',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Brand</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
            },
        },
        {
            name: 'model',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Model</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>MUIC</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) => value.muic || '',
            },
        },
        {
            name: 'code',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Tray ID</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Battery Status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.battery_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Charge Percentage</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.charging?.charge_percentage || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Body Condition</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.charging?.body_condition || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Display Condition</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.charging?.display_condition || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Lock Status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                setCellProps: () => ({ style: { width: '100px' } }),
                customBodyRender: (value, dataIndex) =>
                    value?.charging?.lock_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Charging Jack</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.charging?.charging_jack_type || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Body Missing Part</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.charging?.boady_part_missing || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Blanco QC Status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.blancoo_qc_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Factory Reset Status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.factory_reset_status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>BQC Incomplete Reason</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.bqc_incomplete_reason || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Technical Issue</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.technical_issue || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>BQC User Remark</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.bqc_report?.other || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Original Grade</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.orgGrade || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Audit Recommend Grade</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.grade || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Stage</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.stage || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Reason</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                FileList: (value) => value?.audit_report?.reason,
                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.reason || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Description</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.audit_report?.description || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>RDL 1 Username</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) =>
                    value?.rdl_fls_report?.username || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>RDL 1 Status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.rdl_fls_report?.selected_status || '',
            },
        },

        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>RDL 1 Added Model</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.rdl_fls_report?.model_reg || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>RDL 1 Added Color</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.rdl_fls_report?.color || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>RDL 1 Added Part List</>
                </Typography>
            ),
            options: {
                filter: true,
                display: false,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, tableMeta) => {
                    const dataIndex = tableMeta.rowIndex
                    const partRequired = value?.rdl_fls_report?.partRequired

                    if (partRequired && partRequired.length > 0) {
                        const partsList = partRequired.map((data, index) => {
                            return `${index + 1}.${data?.part_name} - ${
                                data?.part_id
                            }`
                        })

                        return partsList.join(', ')
                    }

                    return ''
                },
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>RDL 1 Added Part List</>
                </Typography>
            ),
            options: {
                filter: true,
                filterType: 'textField',
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, tableMeta) => {
                    const dataIndex = tableMeta.rowIndex
                    const partRequired = value?.rdl_fls_report?.partRequired

                    if (partRequired && partRequired.length > 0) {
                        const partsList = partRequired.map((data, index) => {
                            return `${index + 1}.${data?.part_name} - ${
                                data?.part_id
                            }`
                        })

                        return partsList.join(', ')
                    }

                    return ''
                },
            },
        },
        {
            name: 'closed_date_agent',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>RDL 1 Done Date</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value) =>
                    new Date(value).toLocaleString('en-GB', {
                        hour12: true,
                    }),
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Description</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.rdl_fls_report?.description || '',
            },
        },
    ]
    const columnsForRdlTwo = [
        {
            name: 'items',
            label: (
                <Typography noWrap
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ marginLeft: '7px' }}
                >
                    <>Select</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                setCellProps: () => ({ style: { width: '100px' } }),
                customBodyRender: (value, dataIndex) => {
                    return (
                        <Checkbox
                            onClick={(e) => {
                                handleClick(e)
                            }}
                            id={value.uic}
                            key={value.uic}
                            checked={isCheck.includes(value.uic)}
                        />
                    )
                },
            },
        },
        {
            name: 'index',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Record No</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,

                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography noWrap sx={{ pl: 2 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },

        {
            name: 'items', // field name in the row object
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>UIC</>
                </Typography>
            ), // column title that will be shown in table
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) => value.uic || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Order ID</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) => value.order_id || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>IMEI</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) => value.imei || '',
            },
        },

        {
            name: 'brand',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Brand</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
            },
        },
        {
            name: 'model',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Model</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>MUIC</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) => value.muic || '',
            },
        },
        {
            name: 'code',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Tray ID</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>RDL two status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, dataIndex) =>
                    value?.rdl_repair_report?.status || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Rdl two repair not done reason</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.rdl_repair_report?.reason || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Rdl two description</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column

                customBodyRender: (value, dataIndex) =>
                    value?.rdl_repair_report?.description || '',
            },
        },

        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Part required</>
                </Typography>
            ),
            options: {
                filter: true,

                sort: true, // enable sorting for Brand column
                customBodyRender: (value, tableMeta) => {
                    const dataIndex = tableMeta.rowIndex
                    const partRequired = value?.rdl_fls_report?.partRequired

                    if (partRequired && partRequired.length > 0) {
                        const partsList = partRequired.map((data, index) => {
                            return `${index + 1}.${data?.part_name} - ${
                                data?.part_id
                            }`
                        })

                        return partsList.join(', ')
                    }

                    return ''
                },
            },
        },
        {
            name: 'items',
            label: (
                <Typography noWrap variant="subtitle1" fontWeight="bold">
                    <>Other parts status</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, tableMeta) => {
                    const dataIndex = tableMeta.rowIndex
                    const partRequired =
                        value?.rdl_repair_report?.rdl_two_part_status
                    if (partRequired && partRequired.length > 0) {
                        const partsList = partRequired.map((data, index) => {
                            return `${index + 1}.${data?.part_name} - ${
                                data?.part_id
                            } status :- ${data?.rdl_two_status}`
                        })

                        return partsList.join(', ')
                    }

                    return ''
                },
            },
        },
    ]
    /*--------------------------------------------------------------*/

    const tableData = useMemo(() => {
        return (
            <>
                <ProductTable>
                    <MUIDataTable
                        title={'UNITS'}
                        data={item}
                        columns={columnsOne}
                        options={{
                            filterType: 'multiselect',
                            responsive: 'standared',
                            download: false,
                            sort:true,
                            print: false,
                            showFirstButton: 'true',
                            showLastButton: 'true',

                            textLabels: {
                                body: {
                                    noMatch: isLoading
                                        ? 'Loading...'
                                        : 'Sorry, there is no matching data to display',
                                },
                            },
                            selectableRows: 'none', // set checkbox for each row
                            // search: false, // set search option
                            // filter: false, // set data filter option
                            // download: false, // set download option
                            // print: false, // set print option
                            // pagination: true, //set pagination option
                            // viewColumns: false, // set column option
                            customSort: (data, colIndex, order) => {
                                const columnProperties = {
                                    1: 'price',
                                    2: 'uic',
                                    3: 'order_id',
                                    4: 'imei',
                                    7: 'muic',
                                    9: 'charging.battery_status',
                                    10: 'charging.charge_percentage',
                                    11: 'charging.body_condition',
                                    12: 'charging.display_condition',
                                    13: 'charging.lock_status',
                                    14: 'charging.charging_jack_type',
                                    15: 'charging.boady_part_missing',
                                    // add more columns and properties here
                                }
                                const property = columnProperties[colIndex]

                                if (property) {
                                    return data.sort((a, b) => {
                                        const aPropertyValue =
                                            getValueByProperty(
                                                a.data[colIndex],
                                                property
                                            )
                                        const bPropertyValue =
                                            getValueByProperty(
                                                b.data[colIndex],
                                                property
                                            )
                                        if (
                                            typeof aPropertyValue ===
                                                'string' &&
                                            typeof bPropertyValue === 'string'
                                        ) {
                                            return (
                                                (order === 'asc' ? 1 : -1) *
                                                aPropertyValue.localeCompare(
                                                    bPropertyValue
                                                )
                                            )
                                        }
                                        return (
                                            (parseFloat(aPropertyValue) -
                                                parseFloat(bPropertyValue)) *
                                            (order === 'desc' ? -1 : 1)
                                        )
                                    })
                                }

                                return data.sort((a, b) => {
                                    const aValue = a.data[colIndex]
                                    const bValue = b.data[colIndex]
                                    if (aValue === bValue) {
                                        return 0
                                    }
                                    if (
                                        aValue === null ||
                                        aValue === undefined
                                    ) {
                                        return 1
                                    }
                                    if (
                                        bValue === null ||
                                        bValue === undefined
                                    ) {
                                        return -1
                                    }
                                    if (
                                        typeof aValue === 'string' &&
                                        typeof bValue === 'string'
                                    ) {
                                        return (
                                            (order === 'asc' ? 1 : -1) *
                                            aValue.localeCompare(bValue)
                                        )
                                    }
                                    return (
                                        (parseFloat(aValue) -
                                            parseFloat(bValue)) *
                                        (order === 'desc' ? -1 : 1)
                                    )
                                })

                                function getValueByProperty(data, property) {
                                    const properties = property.split('.')
                                    return (
                                        properties.reduce(
                                            (obj, key) => obj[key],
                                            data
                                        ) || ''
                                    )
                                }
                            },
                            elevation: 0,
                            rowsPerPageOptions: [10, 20, 40, 80, 100],
                        }}
                    />
                </ProductTable>
            </>
        )
    }, [item, columnsOne, isLoading])

    const tableDataTwo = useMemo(() => {
        return (
            <>
                <ProductTableTwo>
                    <MUIDataTable
                        title={'UNITS'}
                        data={item}
                        columns={columnsTwo}
                        options={{
                            filterType: 'multiselect',
                            responsive: 'standared',
                            download: false,
                            print: false,
                            sort: true,
                            showFirstButton: 'true',
                            showLastButton: 'true',
                            textLabels: {
                                body: {
                                    noMatch: isLoading
                                        ? 'Loading...'
                                        : 'Sorry, there is no matching data to display',
                                },
                            },
                            selectableRows: 'none', // set checkbox for each row
                            // search: false, // set search option
                            // filter: false, // set data filter option
                            // download: false, // set download option
                            // print: false, // set print option
                            // pagination: true, //set pagination option
                            // viewColumns: false, // set column option
                            customSort: (data, colIndex, order) => {
                                const columnProperties = {
                                    1: 'price',
                                    2: 'uic',
                                    3: 'order_id',
                                    4: 'imei',
                                    7: 'muic',
                                    9: 'charging.battery_status',
                                    10: 'charging.charge_percentage',
                                    11: 'charging.body_condition',
                                    12: 'charging.display_condition',
                                    13: 'charging.lock_status',
                                    14: 'charging.charging_jack_type',
                                    15: 'charging.boady_part_missing',
                                    16: 'bqc_report.blancoo_qc_status',
                                    17: 'bqc_report.factory_reset_status',
                                    18: 'bqc_report.bqc_incomplete_reason',
                                    19: 'bqc_report.technical_issue',
                                    20: 'bqc_report.other',
                                    // add more columns and properties here
                                }
                                const property = columnProperties[colIndex]

                                if (property) {
                                    return data.sort((a, b) => {
                                        const aPropertyValue =
                                            getValueByProperty(
                                                a.data[colIndex],
                                                property
                                            )
                                        const bPropertyValue =
                                            getValueByProperty(
                                                b.data[colIndex],
                                                property
                                            )
                                        if (
                                            typeof aPropertyValue ===
                                                'string' &&
                                            typeof bPropertyValue === 'string'
                                        ) {
                                            return (
                                                (order === 'asc' ? 1 : -1) *
                                                aPropertyValue.localeCompare(
                                                    bPropertyValue
                                                )
                                            )
                                        }
                                        return (
                                            (parseFloat(aPropertyValue) -
                                                parseFloat(bPropertyValue)) *
                                            (order === 'desc' ? -1 : 1)
                                        )
                                    })
                                }

                                return data.sort((a, b) => {
                                    const aValue = a.data[colIndex]
                                    const bValue = b.data[colIndex]
                                    if (aValue === bValue) {
                                        return 0
                                    }
                                    if (
                                        aValue === null ||
                                        aValue === undefined
                                    ) {
                                        return 1
                                    }
                                    if (
                                        bValue === null ||
                                        bValue === undefined
                                    ) {
                                        return -1
                                    }
                                    if (
                                        typeof aValue === 'string' &&
                                        typeof bValue === 'string'
                                    ) {
                                        return (
                                            (order === 'asc' ? 1 : -1) *
                                            aValue.localeCompare(bValue)
                                        )
                                    }
                                    return (
                                        (parseFloat(aValue) -
                                            parseFloat(bValue)) *
                                        (order === 'desc' ? -1 : 1)
                                    )
                                })

                                function getValueByProperty(data, property) {
                                    const properties = property.split('.')
                                    const value = properties.reduce(
                                        (obj, key) => obj?.[key],
                                        data
                                    )
                                    return value !== undefined ? value : ''
                                }
                            },
                            elevation: 0,
                            rowsPerPageOptions: [10, 20, 40, 80, 100],
                        }}
                    />
                </ProductTableTwo>
            </>
        )
    }, [item, columnsTwo, isLoading])

    const tableDataThree = useMemo(() => {
        return (
            <>
                <ProductTableThere>
                    <MUIDataTable
                        title={'UNITS'}
                        data={item}
                        columns={columnsThree}
                        options={{
                            filterType: 'multiselect',
                            responsive: 'standared',
                            download: false,
                            sort: true,
                            print: false,
                            textLabels: {
                                body: {
                                    noMatch: isLoading
                                        ? 'Loading...'
                                        : 'Sorry, there is no matching data to display',
                                },
                            },

                            showFirstButton: 'true',
                            showLastButton: 'true',
                            selectableRows: 'none', // set checkbox for each row
                            // search: false, // set search option
                            // filter: false, // set data filter option
                            // download: false, // set download option
                            // print: false, // set print option
                            // pagination: true, //set pagination option
                            // viewColumns: false, // set column option
                            customSort: (data, colIndex, order) => {
                                const columnProperties = {
                                    1: 'price',
                                    2: 'uic',
                                    3: 'order_id',
                                    4: 'imei',
                                    7: 'muic',
                                    9: 'charging.battery_status',
                                    10: 'charging.charge_percentage',
                                    11: 'charging.body_condition',
                                    12: 'charging.display_condition',
                                    13: 'charging.lock_status',
                                    14: 'charging.charging_jack_type',
                                    15: 'charging.boady_part_missing',
                                    16: 'bqc_report.blancoo_qc_status',
                                    17: 'bqc_report.factory_reset_status',
                                    18: 'bqc_report.bqc_incomplete_reason',
                                    19: 'bqc_report.technical_issue',
                                    20: 'bqc_report.other',
                                    21: 'audit_report.orgGrade',
                                    22: 'audit_report.grade',
                                    23: 'audit_report.stage',
                                    24: 'audit_report.reason',
                                    25: 'audit_report.description',
                                    // add more columns and properties here
                                }
                                const property = columnProperties[colIndex]

                                if (property) {
                                    return data.sort((a, b) => {
                                        const aPropertyValue =
                                            getValueByProperty(
                                                a.data[colIndex],
                                                property
                                            )
                                        const bPropertyValue =
                                            getValueByProperty(
                                                b.data[colIndex],
                                                property
                                            )
                                        if (
                                            typeof aPropertyValue ===
                                                'string' &&
                                            typeof bPropertyValue === 'string'
                                        ) {
                                            return (
                                                (order === 'asc' ? 1 : -1) *
                                                aPropertyValue.localeCompare(
                                                    bPropertyValue
                                                )
                                            )
                                        }
                                        return (
                                            (parseFloat(aPropertyValue) -
                                                parseFloat(bPropertyValue)) *
                                            (order === 'desc' ? -1 : 1)
                                        )
                                    })
                                }

                                return data.sort((a, b) => {
                                    const aValue = a.data[colIndex]
                                    const bValue = b.data[colIndex]
                                    if (aValue === bValue) {
                                        return 0
                                    }
                                    if (
                                        aValue === null ||
                                        aValue === undefined
                                    ) {
                                        return 1
                                    }
                                    if (
                                        bValue === null ||
                                        bValue === undefined
                                    ) {
                                        return -1
                                    }
                                    if (
                                        typeof aValue === 'string' &&
                                        typeof bValue === 'string'
                                    ) {
                                        return (
                                            (order === 'asc' ? 1 : -1) *
                                            aValue.localeCompare(bValue)
                                        )
                                    }
                                    return (
                                        (parseFloat(aValue) -
                                            parseFloat(bValue)) *
                                        (order === 'desc' ? -1 : 1)
                                    )
                                })

                                function getValueByProperty(data, property) {
                                    const properties = property.split('.')
                                    const value = properties.reduce(
                                        (obj, key) => obj?.[key],
                                        data
                                    )
                                    return value !== undefined ? value : ''
                                }
                            },
                            elevation: 0,
                            rowsPerPageOptions: [10, 20, 40, 80, 100],
                        }}
                    />
                </ProductTableThere>
            </>
        )
    }, [item, columnsThree, isLoading])

    const tableDataForRdl1 = useMemo(() => {
        return (
            <>
                <ProductTableRdlOne>
                    <MUIDataTable
                        title={'UNITS'}
                        data={item}
                        columns={columnsForRdlOne}
                        options={{
                            filterType: 'multiselect',
                            responsive: 'standared',
                            download: false,
                            sort: true,
                            print: false,
                            textLabels: {
                                body: {
                                    noMatch: isLoading
                                        ? 'Loading...'
                                        : 'Sorry, there is no matching data to display',
                                },
                            },
                            showFirstButton: 'true',
                            showLastButton: 'true',
                            selectableRows: 'none',
                            customSort: (data, colIndex, order) => {
                                const columnProperties = {
                                    1: 'price',
                                    2: 'uic',
                                    3: 'order_id',
                                    4: 'imei',
                                    7: 'muic',
                                    9: 'charging.battery_status',
                                    10: 'charging.charge_percentage',
                                    11: 'charging.body_condition',
                                    12: 'charging.display_condition',
                                    13: 'charging.lock_status',
                                    14: 'charging.charging_jack_type',
                                    15: 'charging.boady_part_missing',
                                    16: 'bqc_report.blancoo_qc_status',
                                    17: 'bqc_report.factory_reset_status',
                                    18: 'bqc_report.bqc_incomplete_reason',
                                    19: 'bqc_report.technical_issue',
                                    20: 'bqc_report.other',
                                    21: 'audit_report.orgGrade',
                                    22: 'audit_report.grade',
                                    23: 'audit_report.stage',
                                    24: 'audit_report.reason',
                                    25: 'audit_report.description',
                                    26: 'rdl_fls_report.username',
                                    27: 'rdl_fls_report.selected_status',
                                    28: 'rdl_fls_report.model_reg',
                                    29: 'rdl_fls_report.color',
                                    30: 'rdl_fls_report.partRequired',
                                    31: 'rdl_fls_report.description',
                                }

                                const property = columnProperties[colIndex]

                                if (property) {
                                    return data.sort((a, b) => {
                                        const aPropertyValue =
                                            getValueByProperty(
                                                a.data[colIndex],
                                                property
                                            )
                                        const bPropertyValue =
                                            getValueByProperty(
                                                b.data[colIndex],
                                                property
                                            )

                                        if (
                                            typeof aPropertyValue ===
                                                'string' &&
                                            typeof bPropertyValue === 'string'
                                        ) {
                                            return (
                                                (order === 'asc' ? 1 : -1) *
                                                aPropertyValue.localeCompare(
                                                    bPropertyValue
                                                )
                                            )
                                        }

                                        return (
                                            (parseFloat(aPropertyValue) -
                                                parseFloat(bPropertyValue)) *
                                            (order === 'desc' ? -1 : 1)
                                        )
                                    })
                                }

                                return data.sort((a, b) => {
                                    const aValue = a.data[colIndex]
                                    const bValue = b.data[colIndex]

                                    if (aValue === bValue) {
                                        return 0
                                    }

                                    if (
                                        aValue === null ||
                                        aValue === undefined
                                    ) {
                                        return 1
                                    }

                                    if (
                                        bValue === null ||
                                        bValue === undefined
                                    ) {
                                        return -1
                                    }

                                    if (
                                        typeof aValue === 'string' &&
                                        typeof bValue === 'string'
                                    ) {
                                        return (
                                            (order === 'asc' ? 1 : -1) *
                                            aValue.localeCompare(bValue)
                                        )
                                    }

                                    return (
                                        (parseFloat(aValue) -
                                            parseFloat(bValue)) *
                                        (order === 'desc' ? -1 : 1)
                                    )
                                })

                                function getValueByProperty(data, property) {
                                    const properties = property.split('.')
                                    let value = properties.reduce(
                                        (obj, key) => obj?.[key],
                                        data
                                    )

                                    if (
                                        properties[0] === 'rdl_fls_report' &&
                                        properties[1] === 'partRequired' &&
                                        properties[2] === 'length'
                                    ) {
                                        value = value || 0
                                    }

                                    return value !== undefined ? value : ''
                                }
                            },
                            elevation: 0,
                            rowsPerPageOptions: [10, 20, 40, 80, 100],
                        }}
                    />
                </ProductTableRdlOne>
            </>
        )
    }, [item, columnsForRdlOne, isLoading])

    const tableDataForRdl2 = useMemo(() => {
        return (
            <>
                <ProductTableRdlOne>
                    <MUIDataTable
                        title={'UNITS'}
                        data={item}
                        columns={columnsForRdlTwo}
                        options={{
                            filterType: 'multiselect',
                            responsive: 'standared',
                            download: false,
                            print: false,
                            textLabels: {
                                body: {
                                    noMatch: isLoading
                                        ? 'Loading...'
                                        : 'Sorry, there is no matching data to display',
                                },
                            },
                            showFirstButton: 'true',
                            showLastButton: 'true',
                            selectableRows: 'none',
                            customSort: (data, colIndex, order) => {
                                const columnProperties = {
                                    1: 'price',
                                    2: 'uic',
                                    3: 'order_id',
                                    4: 'imei',
                                    7: 'muic',
                                    9: 'rdl_repair_report.status',
                                    10: 'rdl_repair_report.reason',
                                    11: 'rdl_repair_report.description',
                                    12: 'rdl_fls_report.partRequired',
                                    13: 'rdl_repair_report.rdl_two_part_status',
                                }

                                const property = columnProperties[colIndex]

                                if (property) {
                                    return data.sort((a, b) => {
                                        const aPropertyValue =
                                            getValueByProperty(
                                                a.data[colIndex],
                                                property
                                            )
                                        const bPropertyValue =
                                            getValueByProperty(
                                                b.data[colIndex],
                                                property
                                            )

                                        if (
                                            typeof aPropertyValue ===
                                                'string' &&
                                            typeof bPropertyValue === 'string'
                                        ) {
                                            return (
                                                (order === 'asc' ? 1 : -1) *
                                                aPropertyValue.localeCompare(
                                                    bPropertyValue
                                                )
                                            )
                                        }

                                        return (
                                            (parseFloat(aPropertyValue) -
                                                parseFloat(bPropertyValue)) *
                                            (order === 'desc' ? -1 : 1)
                                        )
                                    })
                                }

                                return data.sort((a, b) => {
                                    const aValue = a.data[colIndex]
                                    const bValue = b.data[colIndex]

                                    if (aValue === bValue) {
                                        return 0
                                    }

                                    if (
                                        aValue === null ||
                                        aValue === undefined
                                    ) {
                                        return 1
                                    }

                                    if (
                                        bValue === null ||
                                        bValue === undefined
                                    ) {
                                        return -1
                                    }

                                    if (
                                        typeof aValue === 'string' &&
                                        typeof bValue === 'string'
                                    ) {
                                        return (
                                            (order === 'asc' ? 1 : -1) *
                                            aValue.localeCompare(bValue)
                                        )
                                    }

                                    return (
                                        (parseFloat(aValue) -
                                            parseFloat(bValue)) *
                                        (order === 'desc' ? -1 : 1)
                                    )
                                })

                                function getValueByProperty(data, property) {
                                    const properties = property.split('.')
                                    let value = properties.reduce(
                                        (obj, key) => obj?.[key],
                                        data
                                    )

                                    if (
                                        properties[0] === 'rdl_fls_report' &&
                                        properties[1] === 'partRequired' &&
                                        properties[2] === 'length'
                                    ) {
                                        value = value || 0
                                    }

                                    return value !== undefined ? value : ''
                                }
                            },
                            elevation: 0,
                            rowsPerPageOptions: [10, 20, 40, 80, 100],
                        }}
                    />
                </ProductTableRdlOne>
            </>
        )
    }, [item, columnsForRdlTwo, isLoading])

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Pickup', path: '/' },
                        { name: 'Units' },
                    ]}
                />
            </div>
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                        >
                            <Tab
                                label="Charge Done Unit's"
                                value="Charge Done"
                                disabled={isLoading}
                            />
                            <Tab
                                disabled={isLoading}
                                label="BQC Done Unit's"
                                value="BQC Done"
                            />
                            <Tab
                                disabled={isLoading}
                                label="Audit Done Unit's"
                                value="Audit Done"
                            />
                            <Tab
                                disabled={isLoading}
                                label="RDL FLS Done Unit's"
                                value="Ready to RDL-Repair"
                            />
                            <Tab
                                disabled={isLoading}
                                label="RDL Two Done Unit's"
                                value="RDL two done closed by warehouse"
                            />
                        </TabList>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mt: 2,
                        }}
                    >
                        <Box sx={{ mt: 1 }}>
                            {/* <TextField
                                label="Search UIC"
                                variant="outlined"
                                sx={{ ml: 3 }}
                                onChange={(e) => {
                                    handelSearchUid(e)
                                }}
                            /> */}
                            <TextField
                                select
                                label="Select Brand"
                                variant="outlined"
                                sx={{ ml: 3, width: 150 }}
                                name="brand"
                                onChange={(e) => {
                                    handleChangeSort(e)
                                }}
                            >
                                {brand.map((brandData) => (
                                    <MenuItem
                                        value={brandData.brand_name}
                                        onClick={(e) => {
                                            fetchModel(brandData.brand_name)
                                        }}
                                    >
                                        {brandData.brand_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Select Model"
                                variant="outlined"
                                name="model"
                                onChange={(e) => {
                                    handleChangeSort(e)
                                }}
                                sx={{ ml: 2, width: 150 }}
                            >
                                {model.map((modelData) => (
                                    <MenuItem value={modelData.model_name}>
                                        {modelData.model_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button
                                sx={{
                                    ml: 2,
                                    mt: 1,
                                }}
                                variant="contained"
                                disabled={
                                    state.brand == undefined ||
                                    state.model == undefined
                                }
                                onClick={() => handelSort()}
                                style={{ backgroundColor: 'green' }}
                                component="span"
                            >
                                Sort
                            </Button>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                            {value == 'Audit Done' ? (
                                <FormControl sx={{ mb: 2, width: 260 }}>
                                    <InputLabel id="demo-multiple-name-label">
                                        Auditor status
                                    </InputLabel>
                                    <Select
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        multiple
                                        value={selectedStatus}
                                        input={
                                            <OutlinedInput label="Auditor status" />
                                        }
                                        MenuProps={MenuProps}
                                        onChange={(e) => {
                                            handleChangeDate(e)
                                        }}
                                    >
                                        <MenuItem value="Accept">
                                            Accept
                                        </MenuItem>
                                        <MenuItem value="Upgrade">
                                            Upgrade
                                        </MenuItem>
                                        <MenuItem value="Downgrade">
                                            Downgrade
                                        </MenuItem>
                                        <MenuItem value="Direct Upgrade">
                                            Direct Upgrade
                                        </MenuItem>
                                        <MenuItem value="Direct Downgrade">
                                            Direct Downgrade
                                        </MenuItem>
                                        <MenuItem value="Repair">
                                            Repair
                                        </MenuItem>
                                        <MenuItem value="BQC Not Done">
                                            BQC Not Done
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            ) : null}
                            {value == 'Ready to RDL-Repair' ? (
                                <FormControl sx={{ mb: 2, width: 260 }}>
                                    <InputLabel id="demo-multiple-name-label">
                                        Rdl 1 status
                                    </InputLabel>
                                    <Select
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        multiple
                                        value={selectedStatus}
                                        input={
                                            <OutlinedInput label=" Rdl 1 status" />
                                        }
                                        MenuProps={MenuProps}
                                        onChange={(e) => {
                                            handleChangeDate(e)
                                        }}
                                    >
                                        <MenuItem value="Battery Boosted">
                                            Battery Boosted
                                        </MenuItem>
                                        <MenuItem value="Charge jack Replaced & Boosted">
                                            Charge jack Replaced & Boosted
                                        </MenuItem>
                                        <MenuItem value="Battery Damage">
                                            Battery Damage
                                        </MenuItem>
                                        <MenuItem value="Repair Required">
                                            Repair Required
                                        </MenuItem>
                                        <MenuItem value="Accept Auditor Feedback">
                                            Accept Auditor Feedback
                                        </MenuItem>
                                        <MenuItem value="Unlocked">
                                            Unlocked
                                        </MenuItem>
                                        <MenuItem value="Issue Resolved Through Software">
                                            Issue Resolved Through Software
                                        </MenuItem>
                                        <MenuItem value="Dead">Dead</MenuItem>
                                        <MenuItem value="Re BQC Required">
                                            Re BQC Required
                                        </MenuItem>
                                        <MenuItem value="Software Installation">
                                            Software Installation
                                        </MenuItem>
                                        <MenuItem value="Motherboard Work">
                                            Motherboard Work
                                        </MenuItem>
                                        <MenuItem value="Repaired Without Part">
                                            Repaired Without Part
                                        </MenuItem>
                                        <MenuItem value="Parts Replaced & Repaired">
                                            Parts Replaced & Repaired
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            ) : null}
                            {value == 'Ready to RDL-Repair' ||
                            value == 'Audit Done' ? (
                                <Button
                                    sx={{ ml: 2, mr: 3 }}
                                    variant="contained"
                                    disabled={selectedStatus.length == 0}
                                    style={{ backgroundColor: 'green' }}
                                    onClick={(e) => {
                                        dataFilter(e)
                                    }}
                                >
                                    Filter
                                </Button>
                            ) : null}

                            <Button
                                sx={{
                                    mr: 3,
                                }}
                                variant="contained"
                                onClick={(e) => fetchAll(e)}
                                style={{ backgroundColor: 'primery' }}
                                component="span"
                            >
                                See all
                            </Button>
                            <Button
                                sx={{
                                    mr: 3,
                                }}
                                variant="contained"
                                disabled={isCheck.length == 0}
                                onClick={() => handelSortingAgent(value)}
                                style={{ backgroundColor: 'primery' }}
                                component="span"
                            >
                                Assign to Sorting
                            </Button>
                        </Box>
                    </Box>
                    <TabPanel value="Charge Done">
                        <Card
                            sx={{ maxHeight: '100%', overflow: 'auto' }}
                            elevation={6}
                        >
                            <ProductTable>{tableData}</ProductTable>
                        </Card>
                    </TabPanel>
                    <TabPanel value="BQC Done">
                        <Card
                            sx={{ maxHeight: '100%', overflow: 'auto' }}
                            elevation={6}
                        >
                            <ProductTableTwo>{tableDataTwo}</ProductTableTwo>
                        </Card>
                    </TabPanel>
                    <TabPanel value="Audit Done">
                        <Card
                            sx={{ maxHeight: '100%', overflow: 'auto' }}
                            elevation={6}
                        >
                            <ProductTableThere>
                                {tableDataThree}
                            </ProductTableThere>
                        </Card>
                    </TabPanel>
                    <TabPanel value="Ready to RDL-Repair">
                        <Card
                            sx={{ maxHeight: '100%', overflow: 'auto' }}
                            elevation={6}
                        >
                            <ProductTableRdlOne>
                                {tableDataForRdl1}
                            </ProductTableRdlOne>
                        </Card>
                    </TabPanel>
                    <TabPanel value="RDL two done closed by warehouse">
                        <Card
                            sx={{ maxHeight: '100%', overflow: 'auto' }}
                            elevation={6}
                        >
                            <ProductTableRdlTwo>
                                {tableDataForRdl2}
                            </ProductTableRdlTwo>
                        </Card>
                    </TabPanel>
                </TabContext>
            </Box>

            {shouldOpenEditorDialog && (
                <AssignToSorting
                    handleClose={handleDialogClose}
                    open={handleDialogOpen}
                    setRefresh={setRefresh}
                    sortingUsers={sortingUsers}
                    whtTray={whtTray}
                    isCheck={isCheck}
                    value={value}
                />
            )}
        </Container>
    )
}

export default PickupPage
