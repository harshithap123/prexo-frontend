import jwt_decode from 'jwt-decode'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect, useMemo } from 'react'
import { styled } from '@mui/system'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'

import {
    TableCell,
    TableHead,
    Table,
    TableContainer,
    TableRow,
    TableBody,
    Card,
    TablePagination,
    TextField,
    Box,
    Typography,
    Button,
} from '@mui/material'

import { useNavigate } from 'react-router-dom'
import { axiosMisUser } from '../../../../axios'
import Swal from 'sweetalert2'

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

const SimpleMuiTable = () => {
    const [page, setPage] = React.useState(0)
    const [rowsPerPage, setRowsPerPage] = React.useState(100)
    const [item, setItem] = useState([])
    const [data, setData] = useState([])
    const [dataForDownload, setDataForDownload] = useState([])
    const navigate = useNavigate()
    const [refresh, setRefresh] = useState(false)
    const [count, setCount] = useState(0)
    const [inputSearch, setInputSearch] = useState('')
    const [displayText, setDisplayText] = useState('')
    const [search, setSearch] = useState({
        type: '',
        searchData: '',
        location: '',
    })

    useEffect(() => {
        let admin = localStorage.getItem('prexo-authentication')
        if (admin) {
            const { location } = jwt_decode(admin)
            setDisplayText('Loading...')
            if (inputSearch !== '') {
                const pageSearch = async () => {
                    let obj = {
                        location: location,
                        type: search.type,
                        searchData: inputSearch,
                        page: page,
                        rowsPerPage: rowsPerPage,
                        type: 'only-limited-data',
                    }
                    let res = await axiosMisUser.post(
                        '/search-mis-track-item',
                        obj
                    )
                    if (res.status == 200) {
                        setDisplayText('')

                        setItem(res.data.data)
                        setCount(res.data.count)
                    } else {
                        setItem(res.data.data)
                        setCount(res.data.count)
                        setDisplayText('Sorry no data found')
                    }
                }
                pageSearch()
            } else {
                const fetchData = async () => {
                    try {
                        let res = await axiosMisUser.post(
                            '/getDeliveredOrders/' +
                                location +
                                '/' +
                                page +
                                '/' +
                                rowsPerPage
                        )
                        if (res.status == 200) {
                            setDisplayText('')
                            setCount(res.data.count)
                            setItem(res.data.data)
                        }
                    } catch (error) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            confirmButtonText: 'Ok',
                            text: error,
                        })
                    }
                }
                fetchData()
            }
        } else {
            navigate('/')
        }
    }, [refresh, page])

    useEffect(() => {
        setData((_) =>
            item.map((d, index) => {
                d.id = page * rowsPerPage + index + 1
                return d
            })
        )
    }, [page, item, rowsPerPage])

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const ProductTable = styled(Table)(() => ({
        minWidth: 750,
        width: '130%',
        height: '100%',
        whiteSpace: 'pre',
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

    const ScrollableTableContainer = styled(TableContainer)`
        overflow-x: auto;
    `

    const searchTrackItem = async (e) => {
        setInputSearch(e.target.value)
        e.preventDefault()
        try {
            let admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                setDisplayText('Searching...')
                let { location } = jwt_decode(admin)
                if (e.target.value == '') {
                    setRefresh((refresh) => !refresh)
                } else {
                    setRowsPerPage(100)
                    setPage(0)
                    let obj = {
                        location: location,
                        type: search.type,
                        searchData: e.target.value,
                        page: page,
                        rowsPerPage: rowsPerPage,
                        type: 'only-limited-data',
                    }
                    let res = await axiosMisUser.post(
                        '/search-mis-track-item',
                        obj
                    )
                    if (res.status == 200) {
                        setDisplayText('')
                        setCount(res.data.count)
                        setItem(res.data.data)
                    } else {
                        setItem(res.data.data)
                        setCount(res.data.count)
                        setDisplayText('Sorry no data found')
                    }
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                confirmButtonText: 'Ok',
                text: error,
            })
        }
    }
    const download = (e) => {
        let arr = []
        for (let x of dataForDownload) {
            let obj = {
                'Order Id': x?.delivery?.order_id,
                'SKU Id': x?.delivery?.item_id,
                'Tracking Id': x?.delivery?.tracking_id,
                IMEI: x?.delivery?.imei,
                'Bot Remarks': x?.delivery?.bot_report?.body_damage_des,
                'Tray Id': x?.delivery?.tray_id,
                UIC: x?.delivery?.uic_code?.code,
                'Purchase Price': x?.delivery?.partner_purchase_price,
                'Tray Location': x?.delivery?.tray_location,
                'Order Date': new Date(x?.delivery?.order_date).toLocaleString(
                    'en-GB',
                    {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    }
                ),
            }

            arr.push(obj)
        }
        const fileExtension = '.xlsx'
        const fileType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        const ws = XLSX.utils.json_to_sheet(arr)

        const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: fileType })
        FileSaver.saveAs(data, 'Item-track' + fileExtension)
    }

    const tableData = useMemo(() => {
        return (
            <ProductTable>
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Record No
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Delivery Status
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Tracking ID
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Order ID
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            UIC Status
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            UIC
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            IMEI
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Item ID
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Stockin Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Bag ID
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Stockin Status
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Bag close Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            BOT Agent Name
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '250px',
                            }}
                        >
                            Assigned to BOT Agent Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Tray ID
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Tray Type
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Tray Status
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Tray Location
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Tray Closed Time BOT
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '400px',
                            }}
                        >
                            Tray Received From BOT Time Warehouse
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '300px',
                            }}
                        >
                            Tray Closed Time Warehouse
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Sorting Agent Name
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Handover to Sorting Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            WHT Tray
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            WHT Tray Assigned Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '300px',
                            }}
                        >
                            WHT Tray Received From Sorting
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '300px',
                            }}
                        >
                            WHT Tray Closed After Sorting
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Charging Username
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Charging Assigned Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Charge In Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Charge Done Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '400px',
                            }}
                        >
                            Tray Received From Charging Time Warehouse
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '400px',
                            }}
                        >
                            Charging Done Tray Closed Time Warehouse
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            BQC Agent Name
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Assigned to BQC
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            BQC Done Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '350px',
                            }}
                        >
                            Tray Received From BQC Time Warehouse
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '350px',
                            }}
                        >
                            Bqc Done Tray Closed Time Warehouse
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Issued to Audit Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Audit Agnet Name
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Audit Done Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '350px',
                            }}
                        >
                            Audit Done Tray Recieved Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '400px',
                            }}
                        >
                            Audit Done Tray Closed By Warehouse Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '150px',
                            }}
                        >
                            CTX Tray Id
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            RDL FLS Agent name
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '250px',
                            }}
                        >
                            Tray Issued to RDL FLS Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '300px',
                            }}
                        >
                            Tray Closed By RDL FLS Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '300px',
                            }}
                        >
                            Tray Received From RDL FLS Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '300px',
                            }}
                        >
                            RDL FLS Done Closed By Warehouse
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '350px',
                            }}
                        >
                            CTX Tray Transfer to Sales Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '450px',
                            }}
                        >
                            CTX Tray Received From Processing and Close By WH
                            Date
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '150px',
                            }}
                        >
                            STX Tray Id
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Item Moved to Billed Bin
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Issued to Sorting (WHT TO RP)
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Sorting Agent Name
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Sorting Agent Name
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Rp Tray
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Sorting Done Closed by Agent
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Received from Sorting By WH
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Sorting Closed By WH
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            Issued to RDL-Two
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            RDL-Two Username
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            RDL-Two Done Closed By Agent
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            RDL-Two Done Received By WH
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                width: '200px',
                            }}
                        >
                            RDL-Two Done Closed By WH
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {displayText !== '' ? (
                        <TableCell
                            colSpan={8}
                            align="center"
                            sx={{ verticalAlign: 'top' }}
                        >
                            <Typography variant="p" gutterBottom>
                                {displayText}
                            </Typography>
                        </TableCell>
                    ) : null}
                    {data.map((data, index) => (
                        <TableRow tabIndex={-1}>
                            <TableCell sx={{ ml: 2 }}>{data.id}</TableCell>
                            <TableCell
                                style={
                                    data.delivery_status == 'Pending'
                                        ? { color: 'red' }
                                        : { color: 'green' }
                                }
                            >
                                {data?.delivery_status}
                            </TableCell>
                            <TableCell>{data.delivery.tracking_id}</TableCell>
                            <TableCell>{data.delivery.order_id}</TableCell>
                            <TableCell
                                style={
                                    data.delivery.uic_status == 'Printed'
                                        ? { color: 'green' }
                                        : data.delivery.uic_status == 'Created'
                                        ? { color: 'orange' }
                                        : { color: 'red' }
                                }
                            >
                                {data.delivery.uic_status}
                            </TableCell>
                            <TableCell>
                                {data.delivery.uic_code?.code}
                            </TableCell>
                            <TableCell>{data.delivery.imei}</TableCell>

                            <TableCell>{data.delivery.item_id}</TableCell>
                            <TableCell>
                                {data?.delivery.stockin_date != undefined
                                    ? new Date(
                                          data?.delivery.stockin_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>{data.delivery.bag_id}</TableCell>
                            <TableCell
                                style={
                                    data.delivery.stock_in_status == 'Valid'
                                        ? { color: 'green' }
                                        : { color: 'red' }
                                }
                            >
                                {data.delivery.stock_in_status}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.bag_close_date != undefined
                                    ? new Date(
                                          data?.delivery.bag_close_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>{data.delivery.agent_name}</TableCell>
                            <TableCell>
                                {data?.delivery.assign_to_agent != undefined
                                    ? new Date(
                                          data?.delivery.assign_to_agent
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>{data.delivery.tray_id}</TableCell>
                            <TableCell>{data.delivery.tray_type}</TableCell>
                            <TableCell>{data.delivery.tray_status}</TableCell>
                            <TableCell>{data.delivery.tray_location}</TableCell>
                            <TableCell>
                                {data?.delivery.tray_closed_by_bot != undefined
                                    ? new Date(
                                          data?.delivery.tray_closed_by_bot
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.bot_done_received != undefined
                                    ? new Date(
                                          data?.delivery.bot_done_received
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.warehouse_close_date !=
                                undefined
                                    ? new Date(
                                          data?.delivery.warehouse_close_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : data?.delivery.tray_close_wh_date !=
                                      undefined
                                    ? new Date(
                                          data?.delivery.tray_close_wh_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : null}
                            </TableCell>
                            <TableCell>
                                {data.delivery.sorting_agent_name}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.handover_sorting_date !=
                                undefined
                                    ? new Date(
                                          data?.delivery.handover_sorting_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>{data.delivery.wht_tray}</TableCell>
                            <TableCell>
                                {data?.delivery.wht_tray_assigned_date !=
                                undefined
                                    ? new Date(
                                          data?.delivery.wht_tray_assigned_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.received_from_sorting !=
                                undefined
                                    ? new Date(
                                          data?.delivery.received_from_sorting
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.closed_from_sorting != undefined
                                    ? new Date(
                                          data?.delivery.closed_from_sorting
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data.delivery.agent_name_charging}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.assign_to_agent_charging !=
                                undefined
                                    ? new Date(
                                          data?.delivery.assign_to_agent_charging
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.charging_in_date != undefined
                                    ? new Date(
                                          data?.delivery.charging_in_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.charging_done_date != undefined
                                    ? new Date(
                                          data?.delivery.charging_done_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.charging_done_received !=
                                undefined
                                    ? new Date(
                                          data?.delivery.charging_done_received
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.charging_done_close != undefined
                                    ? new Date(
                                          data?.delivery.charging_done_close
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data.delivery.agent_name_bqc}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.assign_to_agent_bqc != undefined
                                    ? new Date(
                                          data?.delivery.assign_to_agent_bqc
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>

                            <TableCell>
                                {data?.delivery.bqc_out_date != undefined
                                    ? new Date(
                                          data?.delivery.bqc_out_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.bqc_done_received != undefined
                                    ? new Date(
                                          data?.delivery.bqc_done_received
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.bqc_done_close != undefined
                                    ? new Date(
                                          data?.delivery.bqc_done_close
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.issued_to_audit != undefined
                                    ? new Date(
                                          data?.delivery.issued_to_audit
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.audit_user_name}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.audit_done_date != undefined
                                    ? new Date(
                                          data?.delivery.audit_done_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.audit_done_recieved != undefined
                                    ? new Date(
                                          data?.delivery.audit_done_recieved
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.audit_done_close != undefined
                                    ? new Date(
                                          data?.delivery.audit_done_close
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>{data?.delivery.ctx_tray_id}</TableCell>
                            <TableCell>
                                {data?.delivery?.rdl_fls_one_user_name}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.rdl_fls_issued_date != undefined
                                    ? new Date(
                                          data?.delivery.rdl_fls_issued_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.rdl_fls_closed_date != undefined
                                    ? new Date(
                                          data?.delivery.rdl_fls_closed_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.rdl_fls_done_recieved_date !=
                                undefined
                                    ? new Date(
                                          data?.delivery.rdl_fls_done_recieved_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.rdl_fls_done_closed_wh !=
                                undefined
                                    ? new Date(
                                          data?.delivery.rdl_fls_done_closed_wh
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery
                                    .ctx_tray_transferTo_sales_date != undefined
                                    ? new Date(
                                          data?.delivery.ctx_tray_transferTo_sales_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery.ctx_tray_receive_and_close_wh !=
                                undefined
                                    ? new Date(
                                          data?.delivery.ctx_tray_receive_and_close_wh
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>{data?.delivery.stx_tray_id}</TableCell>
                            <TableCell>
                                {data?.delivery?.item_moved_to_billed_bin}
                            </TableCell>
                            <TableCell>
                                {data?.delivery?.issued_to_wht_to_rp !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.issued_to_wht_to_rp
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery?.wht_to_rp_sorting_agent}
                            </TableCell>
                            <TableCell>{data?.delivery?.rp_tray}</TableCell>
                            <TableCell>
                                {data?.delivery?.wht_to_rp_sorting_done !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.wht_to_rp_sorting_done
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery
                                    ?.wht_to_rp_sorting_done_received !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.wht_to_rp_sorting_done_received
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery
                                    ?.wht_to_rp_sorting_done_received !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.wht_to_rp_sorting_done_received
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery
                                    ?.wht_to_rp_sorting_done_wh_closed !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.wht_to_rp_sorting_done_wh_closed
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery?.issued_to_rdl_two_date !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.issued_to_rdl_two_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery?.rdl_two_user_name}
                            </TableCell>
                            <TableCell>
                                {data?.delivery?.rdl_two_user_name}
                            </TableCell>
                            <TableCell>
                                {data?.delivery?.rdl_two_closed_date !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.rdl_two_closed_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery?.rdl_two_closed_date !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.rdl_two_closed_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery?.received_from_rdl_two !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.received_from_rdl_two
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                            <TableCell>
                                {data?.delivery
                                    ?.rdl_two_done_close_by_warehouse !=
                                undefined
                                    ? new Date(
                                          data?.delivery?.rdl_two_done_close_by_warehouse
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })
                                    : ''}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </ProductTable>
        )
    }, [item, data, displayText])

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Track', path: '/' },
                        { name: 'Track-Item' },
                    ]}
                />
            </div>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <Box>
                    {/* <TextField
                        select
                        label="Select"
                        variant="outlined"
                        sx={{ mb: 1, width: '140px' }}
                        onChange={(e) => {
                            setSearch((p) => ({ ...p, type: e.target.value }))
                        }}
                    >
                        <MenuItem value="order_id">Order Id</MenuItem>
                        <MenuItem value="uic">UIC</MenuItem>
                        <MenuItem value="tracking_id">Tracking ID</MenuItem>
                    </TextField> */}
                    <TextField
                        onChange={(e) => {
                            searchTrackItem(e)
                        }}
                        // disabled={search.type == '' ? true : false}
                        label="Search"
                        variant="outlined"
                        sx={{ mb: 1 }}
                    />
                </Box>
            </Box>
            <Card sx={{ maxHeight: '100%', overflow: 'auto' }} elevation={6}>
                {tableData}
            </Card>
            <TablePagination
                sx={{ px: 2 }}
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                showFirstButton="true"
                showLastButton="true"
                backIconButtonProps={{
                    'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                    'aria-label': 'Next Page',
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={({ target: { value } }) =>
                    setRowsPerPage(value)
                }
            />
        </Container>
    )
}

export default SimpleMuiTable
