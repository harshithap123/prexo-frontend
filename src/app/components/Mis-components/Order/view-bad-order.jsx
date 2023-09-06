import { Breadcrumb } from 'app/components'
import React, { useState, useEffect, useMemo } from 'react'
import { styled } from '@mui/system'
import {
    Button,
    TableCell,
    TableRow,
    TablePagination,
    TableBody,
    Card,
    TableHead,
    Table,
    TableFooter,
    MenuItem,
    Box,
    TextField,
    Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
import jwt_decode from 'jwt-decode'
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
    const navigate = useNavigate()
    const [rowsPerPage, setRowsPerPage] = useState(100)
    const [page, setPage] = useState(0)
    const [item, setItem] = useState([])
    const [data, setData] = useState([])
    const [dataCount, setDataCount] = useState('')
    const [refresh, setRefresh] = useState(false)
    const [dataForDownload, setDataForDownload] = useState([])
    const [displayText, setDisplayText] = useState('')
    const [search, setSearch] = useState({
        type: '',
        searchData: '',
        location: '',
    })

    useEffect(() => {
        try {
            let admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                setDisplayText('Loading...')
                let { location } = jwt_decode(admin)
                const fetchData = async () => {
                    if (search.searchData !== '') {
                        let obj = {
                            location: location,
                            type: search.type,
                            searchData: search.searchData,
                            page: page,
                            rowsPerPage: rowsPerPage,
                        }
                        let res = await axiosMisUser.post(
                            '/badOrdersSearch',
                            obj
                        )
                        if (res.status == 200) {
                            
                            setDisplayText('')
                            setItem(res.data.data)
                            setDataCount(res.data.count)
                        } else {
                            setItem(res.data.data)
                            setDisplayText('Sorry no data found')
                            setItem(res.data.data)
                            setDataCount(res.data.count)
                        }
                    } else {
                        let obj = {
                            location: location,
                            page: page,
                            size: rowsPerPage,
                        }
                        let res = await axiosMisUser.post('/getBadOrders', obj)
                        if (res.status === 200) {
                            setDisplayText('')
                            setItem(res.data.data)
                            setDataCount(res.data.count)
                            setDataForDownload(res.data.dataForDownload)
                        } else {
                            setDisplayText('Sorry No Data Found')
                            setItem(res.data.data)
                            setDataCount(res.data.count)
                        }
                    }
                }
                fetchData()
            } else {
                navigate('/')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                confirmButtonText: 'Ok',
                text: error,
            })
        }
    }, [refresh, page, rowsPerPage])

    useEffect(() => {
        setData((_) =>
            item.map((d, index) => {
                d.id = page * rowsPerPage + index + 1
                return d
            })
        )
    }, [page, item, rowsPerPage])

    const ProductTable = styled(Table)(() => ({
        minWidth: 750,
        // width: 7150,
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
            paddingLeft: '36px !important',
        },
    }))

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }
    const download = (e) => {
        const fileExtension = '.xlsx'
        const fileType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        const ws = XLSX.utils.json_to_sheet(dataForDownload)
        ws['!cols'] = []
        ws['!cols'][0] = { hidden: true }
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: fileType })
        FileSaver.saveAs(data, 'bad-orders' + fileExtension)
    }
    const searchOrders = async (e) => {
        e.preventDefault()

        try {
            setSearch((p) => ({ ...p, searchData: e.target.value }))

            let admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                setDisplayText('Searching...')
                let { location } = jwt_decode(admin)
                if (e.target.value === '') {
                    setRefresh((refresh) => !refresh)
                } else {
                    let obj = {
                        location: location,
                        type: search.type,
                        searchData: e.target.value,
                        page: page,
                        rowsPerPage: rowsPerPage,
                    }
                    let res = await axiosMisUser.post('/badOrdersSearch', obj)
                    if (res.status == 200) {
                        setRowsPerPage(100)
                        setPage(0)
                        setDisplayText('')
                        setItem(res.data.data)
                        setDataCount(res.data.count)
                    } else {
                        setItem(res.data.data)
                        setDisplayText('Sorry no data found')
                        setItem(res.data.data)
                        setDataCount(res.data.count)
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
    const TableData = useMemo(() => {
        return (
            <ProductTable>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Record.No</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'250px'}}>Order Imported TimeStamp</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Order ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Order Date</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Order TimeStamp</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Order Status</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Item ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Partner ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Old Item Details</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>IMEI</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Base Disscount</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Diganostic</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Partner Purchase Price</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Tracking ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Delivery Date</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Order ID Replaced</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Deliverd With OTP</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'250px'}}>Deliverd With Bag Exception</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>GC Amount Redeemed</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>GC Amount Refund</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>GC Redeem Time</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>GC Amount Refund Time</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Diagonstic Status</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>VC Eligible</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'400px'}}>
                            Customer Declaration Physical Defect Present
                        </TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'400px'}}>
                            Customer Declaration Physical Defect Type
                        </TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Partner Price No Defect</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Revised Partner Price</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Delivery Fee</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Exchange Facilitation Fee</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Reason</TableCell>
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
                            <TableCell sx={{pl:4}}>{data.id}</TableCell>
                            <TableCell>
                                {new Date(data.created_at).toLocaleString(
                                    'en-GB',
                                    {
                                        hour12: true,
                                    }
                                )}
                            </TableCell>
                            <TableCell>{data.order_id?.toString()}</TableCell>
                            <TableCell>
                                {data?.order_date == null
                                    ? ''
                                    : new Date(data.order_date).toLocaleString(
                                          'en-GB',
                                          {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                          }
                                      )}
                            </TableCell>
                            <TableCell>
                                {data?.order_timestamp == null
                                    ? ''
                                    : new Date(
                                          data.order_timestamp
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell>
                                {data.order_status?.toString()}
                            </TableCell>
                            <TableCell>{data.partner_id?.toString()}</TableCell>
                            <TableCell>{data.item_id?.toString()}</TableCell>
                            <TableCell>
                                {data.old_item_details?.toString()}
                            </TableCell>
                            <TableCell>{data.imei?.toString()}</TableCell>
                            <TableCell>
                                ₹{data.base_discount?.toString()}
                            </TableCell>
                            <TableCell>{data.diagnostic}</TableCell>
                            <TableCell>
                                ₹{data.partner_purchase_price}
                            </TableCell>
                            <TableCell>{data.tracking_id}</TableCell>
                            <TableCell>
                                {data.delivery_date == null
                                    ? ''
                                    : new Date(
                                          data.delivery_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell>{data.order_id_replaced}</TableCell>
                            <TableCell>{data.deliverd_with_otp}</TableCell>
                            <TableCell>
                                {data.deliverd_with_bag_exception}
                            </TableCell>
                            <TableCell>
                                {data.gc_amount_redeemed?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.gc_amount_refund?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.gc_redeem_time == null
                                    ? ''
                                    : new Date(
                                          data.gc_redeem_time
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell>
                                {data.gc_amount_refund_time == null
                                    ? ''
                                    : new Date(
                                          data.gc_amount_refund_time
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell>
                                {data.diagnstic_status?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.vc_eligible?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.customer_declaration_physical_defect_present?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.customer_declaration_physical_defect_type?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.partner_price_no_defect?.toString()}
                            </TableCell>
                            <TableCell>
                                ₹{data.revised_partner_price?.toString()}
                            </TableCell>
                            <TableCell>
                                ₹{data.delivery_fee?.toString()}
                            </TableCell>
                            <TableCell>
                                ₹{data.exchange_facilitation_fee?.toString()}
                            </TableCell>
                            <TableCell style={{ color: 'red' }}>
                                {data?.reason?.join(', ')}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </ProductTable>
        )
    }, [data])
    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Order', path: '/' },
                        { name: 'Bad-Orders', path: '/' },
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
                    <TextField
                        select
                        label="Select"
                        variant="outlined"
                        sx={{ mb: 1, width: '140px' }}
                        onChange={(e) => {
                            setSearch((p) => ({ ...p, type: e.target.value }))
                        }}
                    >
                        <MenuItem value="order_id">Order Id</MenuItem>
                        <MenuItem value="order_status">
                            Delivery Status
                        </MenuItem>
                        <MenuItem value="imei">IMEI</MenuItem>
                        <MenuItem value="tracking_id">Tracking ID</MenuItem>
                        <MenuItem value="item_id">Item ID</MenuItem>
                        <MenuItem value="old_item_details">
                            OLD Item Details
                        </MenuItem>
                    </TextField>
                    <TextField
                        onChange={(e) => {
                            searchOrders(e)
                        }}
                        disabled={search.type === '' ? true : false}
                        label="Search"
                        variant="outlined"
                        sx={{ ml: 2, mb: 1 }}
                    />
                </Box>
                <Box>
                    <Button
                        sx={{ mb: 2 }}
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                            download(e)
                        }}
                    >
                        Download
                    </Button>
                </Box>
            </Box>

            <Card sx={{ maxHeight: '100%', overflow: 'auto' }} elevation={6}>
                {TableData}
            </Card>
            <>
                <TablePagination
                    sx={{ px: 2 }}
                    rowsPerPageOptions={[50, 100, 150]}
                    component="div"
                    count={dataCount}
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
            </>
        </Container>
    )
}

export default SimpleMuiTable
