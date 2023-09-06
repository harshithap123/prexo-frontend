import jwt_decode from 'jwt-decode'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect, useMemo } from 'react'
import * as XLSX from 'xlsx'
import * as FileSaver from 'file-saver'
import { styled } from '@mui/system'
import {
    Button,
    TableCell,
    TableHead,
    Table,
    TableRow,
    TableBody,
    Card,
    TablePagination,
    Checkbox,
    Box,
    MenuItem,
    TextField,
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
    const [item, setItem] = useState([])
    const [rowsPerPage, setRowsPerPage] = React.useState(10)
    const navigate = useNavigate()
    const [isCheckAll, setIsCheckAll] = useState(false)
    const [isCheck, setIsCheck] = useState([])
    const [data, setData] = useState([])
    const [deliveryCount, setDeliveryCount] = useState(0)
    const [isAlive, setIsAlive] = useState(true)
    const [search, setSearch] = useState({
        type: '',
        searchData: '',
        location: '',
    })

    useEffect(() => {
        try {
            let admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                let { location } = jwt_decode(admin)
                const fetchData = async () => {
                    if (search.searchData != '') {
                        let obj = {
                            location: location,
                            type: search.type,
                            searchData: search.searchData,
                            uic_status: 'Pending',
                            page: page,
                            rowsPerPage: rowsPerPage,
                        }

                        let res = await axiosMisUser.post('/searchUicPage', obj)

                        if (res.status == 200 && res.data.data?.length !== 0) {
                            setItem(res.data.data)
                        } else {
                            Swal.fire({
                                position: 'top-center',
                                icon: 'error',
                                title: 'No Data Found',
                                confirmButtonText: 'Ok',
                            })
                        }
                    } else {
                        let obj = {
                            status: 'Pending',
                            location: location,
                            page: page,
                            size: rowsPerPage,
                        }
                        let res = await axiosMisUser.post(
                            '/uicGeneratedRecon',
                            obj
                        )
                        if (res.status == 200) {
                            setItem(res.data.data)
                            setDeliveryCount(res.data.count)
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
    }, [page, isAlive])

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

    const handleSelectAll = (e) => {
        setIsCheckAll(!isCheckAll)
        setIsCheck(item.map((li, index) => index.toString()))
        if (isCheckAll) {
            setIsCheck([])
        }
    }
    const handleClick = (e) => {
        const { id, checked } = e.target
        setIsCheck([...isCheck, id])
        if (!checked) {
            setIsCheck(isCheck.filter((item) => item !== id))
        }
    }

    const ProductTable = styled(Table)(() => ({
        minWidth: 750,
        width: '150%',
        height:'100%',
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

    const handelUicGen = (e) => {
        e.preventDefault()
        if (isCheck.length == 0) {
            Swal.fire({
                position: 'top-center',
                icon: 'error',
                title: ' Please Select Atleast One Delivery Data',
                confirmButtonText: 'Ok',
            })
        } else {
            let token = localStorage.getItem('prexo-authentication')
            if (token) {
                const { user_name } = jwt_decode(token)

                const addUic = async () => {
                    let count = 0
                    for (let i = 0; i < isCheck.length; i++) {
                        if (item[isCheck[i]].uic_status != 'Pending') {
                            Swal.fire({
                                position: 'top-center',
                                icon: 'warning',
                                title: 'Already UIC Created',
                                confirmButtonText: 'Ok',
                            })

                            break
                        }
                        try {
                            let obj = {
                                _id: item[isCheck[i]]?._id,
                                email: user_name,
                                created_at: Date.now(),
                            }
                            let res = await axiosMisUser.post(
                                '/addUicCode',
                                obj
                            )
                            if (res.status == 200) {
                            } else {
                                Swal.fire({
                                    position: 'top-center',
                                    icon: 'error',
                                    title: res?.data?.message,
                                    confirmButtonText: 'Ok',
                                })
                            }
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                confirmButtonText: 'Ok',
                                text: error,
                            })
                        }
                        count++
                    }
                    if (count == isCheck.length) {
                        Swal.fire({
                            position: 'top-center',
                            icon: 'success',
                            title: 'Successfully Generated',
                            confirmButtonText: 'Ok',
                        })
                        setIsCheck([])
                        setIsAlive((isAlive) => !isAlive)
                    }
                }
                addUic()
            }
        }
    }

    const label = { inputProps: { 'aria-label': 'Checkbox demo' } }
    const fileType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const fileExtension = '.xlsx'

    const exportToCSV = (fileName) => {
        if (isCheck.length == 0) {
            Swal.fire({
                position: 'top-center',
                icon: 'error',
                title: 'Please Select Atleast One Data',
                confirmButtonText: 'Ok',
            })
        } else {
            let arr = []
            let status = false
            let changeStatus = async () => {
                for (let i = 0; i < isCheck.length; i++) {
                    if (item[isCheck[i]].uic_code == undefined) {
                        Swal.fire({
                            position: 'top-center',
                            icon: 'error',
                            title: 'Please Geanerate UIC',
                            confirmButtonText: 'Ok',
                        })
                        status = true
                        break
                    } else {
                        try {
                            let res = await axiosMisUser.post(
                                '/changeUicStatus/' + item[isCheck[i]]._id
                            )
                            if (res.status == 200) {
                            } else {
                                Swal.fire({
                                    position: 'top-center',
                                    icon: 'error',
                                    title: res?.data?.message,
                                    confirmButtonText: 'Ok',
                                })
                            }
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                confirmButtonText: 'Ok',
                                text: error,
                            })
                        }
                        let obj = {
                            UIC: item[isCheck[i]].uic_code?.code,
                            IMEI: item[isCheck[i]]?.order?.imei?.replace(
                                /[^a-zA-Z0-9 ]/g,
                                ''
                            ),
                            Model: item[
                                isCheck[i]
                            ]?.order?.old_item_details?.replace(
                                /[^a-zA-Z0-9 ]/g,
                                ' '
                            ),
                        }
                        arr.push(obj)
                    }
                }
                if (status == false) {
                    download(arr, fileName)
                }
            }
            changeStatus()
        }
    }
    function download(arr, fileName) {
        const ws = XLSX.utils.json_to_sheet(arr)
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: fileType })
        FileSaver.saveAs(data, fileName + fileExtension)
        setIsCheck([])
        setIsAlive((isAlive) => !isAlive)
    }

    const searchOrders = async (e) => {
        e.preventDefault()
        try {
            let admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                setSearch((p) => ({ ...p, searchData: e.target.value }))
                let { location } = jwt_decode(admin)
                if (e.target.value == '') {
                    setItem([])
                    setRowsPerPage(10)
                    setPage(0)
                    setIsAlive((isAlive) => !isAlive)
                } else {
                    let obj = {
                        location: location,
                        type: search.type,
                        searchData: e.target.value,
                        uic_status: 'Pending',
                        page: page,
                        rowsPerPage: rowsPerPage,
                    }

                    let res = await axiosMisUser.post('/searchUicPage', obj)
                    setRowsPerPage(10)
                    setPage(0)
                    if (res.status == 200 && res.data.data?.length !== 0) {
                        setItem(res.data.data)
                    } else {
                        Swal.fire({
                            position: 'top-center',
                            icon: 'error',
                            title: 'No Data Found',
                            confirmButtonText: 'Ok',
                        })
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

    const tableData = useMemo(() => {
        return (
            <ProductTable>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px', paddingTop:'15px'}}>
                            {' '}
                            <Checkbox
                                {...label}
                                onClick={(e) => {
                                    handleSelectAll()
                                }}
                                checked={
                                    item.length == isCheck.length ? true : false
                                }
                            />{' '}
                            Select All
                        </TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'100px'}}>Record.NO</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'150px'}}>UIC Status</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>UIC Generated Admin</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'150px'}}>UIC Generated Time</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'150px'}}>UIC Code</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>UIC Downloaded Time</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'150px'}}>Delivery Status</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Actual Delivery Date</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Order ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'150px'}}>Order Date</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Order TimeStamp</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'150px'}}>Order Status</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Partner ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Item ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Old Item Details</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>IMEI</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Base Disscount</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Diganostic</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Partner Purchase Price</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Tracking ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Delivery Date</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Order ID Replaced</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Deliverd With OTP</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'250px'}}>Deliverd With Bag Exception</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>GC Amount Redeemed</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>GC Amount Refund</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>GC Redeem Time</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>GC Amount Refund Time</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>Diagonstic Status</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'200px'}}>VC Eligible</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px',width:'400px'}}>
                            Customer Declaration Physical Defect Present
                        </TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'350px'}}>
                            Customer Declaration Physical Defect Type
                        </TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Partner Price No Defect</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Revised Partner Price</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Delivery Fee</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Exchange Facilitation Fee</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Tracking ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Order ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Item ID</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Gep Order</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>IMEI</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Partner Purchase Price</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Partner Shop</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Base Discount</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Diganostic Discount</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Storage Discount</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Buyback Category</TableCell>
                        <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Doorstep Diganostic</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((data, index) => (
                        <TableRow tabIndex={-1}>
                            <TableCell>
                                {' '}
                                <Checkbox
                                    {...label}
                                    onClick={(e) => {
                                        handleClick(e)
                                    }}
                                    id={index}
                                    key={index}
                                    checked={isCheck.includes(
                                        index?.toString()
                                    )}
                                />
                            </TableCell>
                            <TableCell sx={{pl:4}}>{data.id}</TableCell>
                            <TableCell
                                style={
                                    data.uic_status == 'Pending'
                                        ? { color: 'red' }
                                        : data.uic_status == 'Created'
                                        ? { color: 'orange' }
                                        : { color: 'green' }
                                }
                            >
                                {data.uic_status}
                            </TableCell>
                            <TableCell>{data.uic_code?.user}</TableCell>
                            <TableCell>
                                {' '}
                                {data.uic_code?.created_at == undefined
                                    ? ''
                                    : new Date(
                                          data.uic_code?.created_at
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell>{data?.uic_code?.code}</TableCell>
                            <TableCell>
                                {data?.download_time == undefined
                                    ? ''
                                    : new Date(
                                          data?.download_time
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell style={{ color: 'green' }}>
                                {data.order.delivery_status}
                            </TableCell>
                            <TableCell>
                                {new Date(data?.delivery_date).toLocaleString(
                                    'en-GB',
                                    {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    }
                                )}
                            </TableCell>
                            <TableCell>
                                {data.order.order_id?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.order_date == null
                                    ? ''
                                    : new Date(
                                          data.order.order_date
                                      ).toLocaleString('en-GB', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                      })}
                            </TableCell>
                            <TableCell>
                                {data?.order.order_timestamp == null
                                    ? ''
                                    : new Date(
                                          data.order.order_timestamp
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell>
                                {data.order.order_status?.toString()}
                            </TableCell>

                            <TableCell>
                                {data.order.partner_id?.toString()}
                            </TableCell>

                            <TableCell>
                                {data.order.item_id?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.old_item_details?.toString()}
                            </TableCell>
                            <TableCell>{data.order.imei?.toString()}</TableCell>

                            <TableCell>
                                {data.order.base_discount?.toString()}
                            </TableCell>
                            <TableCell>{data.order.diagnostic}</TableCell>
                            <TableCell>
                                {data.order.partner_purchase_price}
                            </TableCell>
                            <TableCell>{data.order.tracking_id}</TableCell>
                            <TableCell>
                                {' '}
                                {data.order.delivery_date == undefined
                                    ? ''
                                    : new Date(
                                          data.order.delivery_date
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell>
                                {data.order.order_id_replaced}
                            </TableCell>
                            <TableCell>
                                {data.order.deliverd_with_otp}
                            </TableCell>
                            <TableCell>
                                {data.order.deliverd_with_bag_exception}
                            </TableCell>
                            <TableCell>
                                {data.order.gc_amount_redeemed?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.gc_amount_refund?.toString()}
                            </TableCell>
                            <TableCell>
                                {data?.order.gc_redeem_time == null
                                    ? ''
                                    : new Date(
                                          data.order.gc_redeem_time
                                      ).toLocaleString('en-GB', {
                                          hour12: true,
                                      })}
                            </TableCell>
                            <TableCell>
                                {data.order.gc_amount_refund_time?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.diagnstic_status?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.vc_eligible?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.customer_declaration_physical_defect_present?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.customer_declaration_physical_defect_type?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.partner_price_no_defect?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.revised_partner_price?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.delivery_fee?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.order.$exchange_facilitation_fee?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.tracking_id?.toString()}
                            </TableCell>
                            <TableCell>{data.order_id?.toString()}</TableCell>

                            <TableCell>{data.item_id?.toString()}</TableCell>
                            <TableCell>{data.gep_order?.toString()}</TableCell>
                            <TableCell>{data.imei?.toString()}</TableCell>
                            <TableCell>
                                {data.partner_purchase_price?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.partner_shop?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.base_discount?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.diagnostics_discount?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.storage_disscount?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.buyback_category?.toString()}
                            </TableCell>
                            <TableCell>
                                {data.doorsteps_diagnostics?.toString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </ProductTable>
        )
    }, [data, isCheck, item])

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'UIC-Manage', path: '/' },
                        { name: 'UIC-Not-Generated' },
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
                        <MenuItem value="uic">UIC</MenuItem>
                        <MenuItem value="imei">IMEI</MenuItem>
                        <MenuItem value="tracking_id">Tracking ID</MenuItem>
                        <MenuItem value="item_id">Item ID</MenuItem>
                    </TextField>
                    <TextField
                        onChange={(e) => {
                            searchOrders(e)
                        }}
                        disabled={search.type == '' ? true : false}
                        label="Search"
                        variant="outlined"
                        sx={{ ml: 2, mb: 1 }}
                    />
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        sx={{ mb: 2, m: 1 }}
                        style={{ backgroundColor: 'primery' }}
                        onClick={(e) => {
                            handelUicGen(e)
                        }}
                    >
                        Generate UIC
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ m: 1 }}
                        onClick={(e) => {
                            exportToCSV('UIC-Printing-Sheet')
                        }}
                    >
                        Download
                    </Button>
                </Box>
            </Box>
            <Card sx={{ maxHeight: '100%', overflow: 'auto' }} elevation={6}>
                {tableData}
            </Card>
            <TablePagination
                sx={{ px: 2 }}
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={deliveryCount}
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
