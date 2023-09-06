import {
    IconButton,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Icon,
    Card,
    Button,
    TextField,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { Box, styled } from '@mui/system'
import { SimpleCard, Breadcrumb } from 'app/components'
import { useNavigate } from 'react-router-dom'
import DoneIcon from '@mui/icons-material/Done'
import ClearIcon from '@mui/icons-material/Clear'
import jwt_decode from 'jwt-decode'
import * as XLSX from 'xlsx'
import { axiosMisUser } from '../../../../axios'
import CircularProgress from '@mui/material/CircularProgress'
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

const StyledLoading = styled('div')(() => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
        width: 'auto',
        height: '25px',
    },
    '& .circleProgress': {
        position: 'absolute',
        left: -7,
        right: 0,
        top: 'calc(50% - 25px)',
    },
}))

const ProductTable = styled(Table)(() => ({
    minWidth: 750,
    width: 7000,
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

const PaginationTable = () => {
    const [validate, setValidate] = useState(false)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [item, setItem] = useState([])
    const [err, setErr] = useState({})
    const [exFile, setExfile] = useState(null)
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        item: [],
        totalPage: 0,
    })

    useEffect(() => {
        setItem((_) =>
            pagination.item
                .slice(
                    (pagination.page - 1) * pagination.size,
                    pagination.page * pagination.size
                )
                .map((d, index) => {
                    d.id = (pagination.page - 1) * pagination.size + index + 1
                    return d
                })
        )
    }, [pagination.page, pagination.item])

    const importExcel = (e) => {
        if (exFile == null) {
            Swal.fire({
                position: 'top-center',
                icon: 'warning',
                title: 'Please Select File',
                confirmButtonText: 'Ok',
            })
        } else {
            setLoading(true)
            readExcel(exFile)
        }
    }
    const readExcel = async (file) => {
        const promise = new Promise((resolve, reject) => {
            const filReader = new FileReader()
            filReader.readAsArrayBuffer(file)
            filReader.onload = (e) => {
                const bufferArray = e.target.result
                const wb = XLSX.read(bufferArray, { cellDates: true })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const data = XLSX.utils.sheet_to_json(ws, { raw: false })
                resolve(data)
            }
            filReader.onerror = (error) => {
                reject(error)
            }
        })
        const data = await promise
        setPagination((p) => ({
            ...p,
            page: 1,
            item: data.map((d, index) => toLowerKeys(d, index)),
            totalPage: Math.ceil(data.length / p.size),
        }))
        setLoading(false)
    }
    function toLowerKeys(obj, id) {
        return Object.keys(obj).reduce((accumulator, key) => {
            accumulator.created_at = Date.now()
            accumulator[key.toLowerCase()?.split(' ').join('_')] = obj[key]
            accumulator.delet_id = id
            return accumulator
        }, {})
    }
    // Validate the data
    const handelValidate = async (e) => {
        try {
            setLoading(true)
            let admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                let { location } = jwt_decode(admin)
                let obj = {
                    item: pagination.item,
                    location: location,
                }
                let res = await axiosMisUser.post('/bulkOrdersValidation', obj)
                if (res.status == 200) {
                    setValidate(true)
                    setLoading(false)
                    setErr({})
                    Swal.fire({
                        position: 'top-center',
                        icon: 'success',
                        title: res?.data?.message,
                        confirmButtonText: 'Ok',
                    })
                } else {
                    setErr(res.data.data)
                    setValidate(true)
                    setLoading(false)

                    Swal.fire({
                        position: 'top-center',
                        icon: 'error',
                        title: res?.data?.message,
                        confirmButtonText: 'Ok',
                    })
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
    // handelSubmit
    const handelSubmit = async (e) => {
        try {
            setLoading(true)
            let obj = {
                validItem: [],
                invalidItem: [],
            }
            pagination.item.forEach((data) => {
                data.reason = []
                if (err?.order_date?.includes(data?.order_date)) {
                    data.reason.push('Invalid order date')
                }

                if (
                    err?.order_id_is_duplicate?.includes(data?.order_id) ||
                    data?.order_id == undefined ||
                    data?.order_id == ''
                ) {
                    data.reason.push('Duplicate order id or order id is empty')
                }
                if (err?.tracking_id?.includes(data?.tracking_id)) {
                    data.reason.push('Tracking Id Must Be 12 Digits')
                }
                if (
                    err?.partner_id_does_not_exist?.includes(
                        data?.partner_id
                    ) ||
                    data?.partner_id == undefined ||
                    data?.partner_id == ''
                ) {
                    data.reason.push('Partner id does not exists')
                }
                if (
                    err?.partner_id_does_not_exist?.includes(
                        data?.partner_shop
                    ) ||
                    data?.partner_shop == undefined ||
                    data?.partner_shop == ''
                ) {
                    data.reason.push('Partner shop does not exists')
                }
                if (
                    err?.item_id_does_not_exist?.includes(data.item_id) ||
                    data?.item_id == undefined ||
                    data?.item_id == ''
                ) {
                    data.reason.push('Item id does not exists')
                }
                if (
                    err?.brand_name_does_not_exist?.includes(
                        data?.old_item_details?.split(':')?.[0]
                    ) ||
                    data?.old_item_details?.split(':')?.[0] == undefined ||
                    data?.old_item_details?.split(':')?.[0] == ''
                ) {
                    data.reason.push('Brand name does not exists')
                }
                if (
                    err?.model_name_does_not_exist?.includes(
                        data?.old_item_details?.split(':')?.[1]
                    ) ||
                    data?.old_item_details?.split(':')?.[1] == undefined ||
                    data?.old_item_details?.split(':')?.[1] == ''
                ) {
                    data.reason.push('Model name does not exists')
                }
                if (
                    err?.imei_number_is_duplicate?.some(
                        (d) =>
                            d.imei == data['imei'] &&
                            d.status == data.order_status
                    ) ||
                    data?.imei == undefined ||
                    data.imei == ''
                ) {
                    data.reason.push(
                        'Invalid IMEI number'
                    )
                }
                if (data.order_status !== 'NEW') {
                    data.reason.push('Not a NEW Order')
                }

                if (data.order_status == 'NEW') {
                    if (
                        err?.order_id_is_duplicate?.includes(data?.order_id) ||
                        data?.order_id == undefined ||
                        data?.order_id == ''
                    ) {
                        obj.invalidItem.push(data)
                    } else if (err?.tracking_id?.includes(data?.tracking_id)) {
                        obj.invalidItem.push(data)
                    } else if (
                        err?.partner_id_does_not_exist?.includes(
                            data?.partner_id
                        ) ||
                        data?.partner_id == undefined ||
                        data?.partner_id == ''
                    ) {
                        obj.invalidItem.push(data)
                    } else if (
                        err?.partner_id_does_not_exist?.includes(
                            data?.partner_shop
                        ) ||
                        data?.partner_shop == undefined ||
                        data?.partner_shop == ''
                    ) {
                        obj.invalidItem.push(data)
                    } else if (
                        err?.item_id_does_not_exist?.includes(data.item_id) ||
                        data?.item_id == undefined ||
                        data?.item_id == ''
                    ) {
                        obj.invalidItem.push(data)
                    } else if (
                        err?.brand_name_does_not_exist?.includes(
                            data?.old_item_details?.split(':')?.[0]
                        ) ||
                        data?.old_item_details?.split(':')?.[0] == undefined ||
                        data?.old_item_details?.split(':')?.[0] == ''
                    ) {
                        obj.invalidItem.push(data)
                    } else if (
                        err?.brand_name_does_not_exist?.includes(
                            data?.old_item_details?.split(':')?.[1]
                        ) ||
                        data?.old_item_details?.split(':')?.[1] == undefined ||
                        data?.old_item_details?.split(':')?.[1] == ''
                    ) {
                        obj.invalidItem.push(data)
                    } else if (
                        err?.imei_number_is_duplicate?.some(
                            (d) =>
                                d.imei == data['imei'] &&
                                d.status == data.order_status
                        ) ||
                        data?.imei == undefined ||
                        data.imei == ''
                    ) {
                        obj.invalidItem.push(data)
                    } else if (err?.order_date?.includes(data?.order_date)) {
                        obj.invalidItem.push(data)
                    } else {
                        obj.validItem.push(data)
                    }
                } else {
                    obj.invalidItem.push(data)
                }
                data.order_date = new Date(data.order_date)
                data.order_timestamp = new Date(data.order_timestamp)
                data.delivery_date = new Date(data.gc_redeem_time)
                data.gc_redeem_time = new Date(data.gc_redeem_time)
                data.base_discount = data?.base_discount?.toString()
                data.order_id_replaced = data.order_id_replaced?.toString()
                data.gc_amount_redeemed = data.gc_amount_redeemed?.toString()
                data.gc_amount_refund = data.gc_amount_refund?.toString()
            })
            let res = await axiosMisUser.post('/ordersImport', obj)
            if (res.status == 200) {
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: 'Successfully Added',
                    confirmButtonText: 'Ok',
                })
                setLoading(false)
                navigate('/mis/orders')
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
    // ----------------------------------------------------------------------------------------------------------------------------
    const updateFieldChanged = (delet_id) => (e) => {
        setValidate(false)
        setPagination((p) => ({
            ...p,
            item: pagination.item.map((data, i) => {
                if (data.delet_id === delet_id) {
                    return { ...data, [e.target.name]: e.target.value }
                } else {
                    return data
                }
            }),
        }))
    }
    // DATA DELETE FROM ARRAY
    const handelDelete = (delet_id) => {
        setValidate(false)
        setPagination((p) => ({
            ...p,
            item: pagination.item.filter((item) => item.delet_id != delet_id),
        }))
    }

    console.log(err?.order_date)

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Order', path: '/' },
                        { name: 'Bulk Order', path: '/' },
                    ]}
                />
            </div>
            <SimpleCard title="Bulk Order">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <h4>Upload file</h4>

                    <Box>
                        <Button
                            sx={{ mb: 2 }}
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/mis/orders')}
                        >
                            Back to list
                        </Button>
                        <Button
                            sx={{ mb: 2, ml: 2 }}
                            variant="contained"
                            color="primary"
                            href={
                                process.env.PUBLIC_URL +
                                '/bulk-order-sheet-sample.xlsx'
                            }
                            download
                        >
                            Download Sample Sheet
                        </Button>
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: 'column',
                        mb: 5,
                    }}
                >
                    <TextField
                        size="small"
                        onChange={(e) => {
                            setExfile(e.target.files[0])
                        }}
                        variant="outlined"
                        type="file"
                    />
                    {item.length == 0 ? (
                        <Button
                            variant="contained"
                            sx={{ mt: 3, mb: 1 }}
                            disabled={loading}
                            onClick={(e) => {
                                importExcel(e)
                            }}
                        >
                            Import
                        </Button>
                    ) : validate ? (
                        <Button
                            variant="contained"
                            sx={{ mt: 3, mb: 1 }}
                            disabled={loading}
                            style={{ backgroundColor: '#206CE2' }}
                            onClick={(e) => {
                                handelSubmit(e)
                            }}
                        >
                            Submit
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            sx={{ mt: 3, mb: 1 }}
                            disabled={loading}
                            style={{ backgroundColor: '#206CE2' }}
                            onClick={(e) => {
                                handelValidate(e)
                            }}
                        >
                            Validate Data
                        </Button>
                    )}
                </Box>
                <>
                    {item.length != 0 && loading !== true ? (
                        <>
                            <Box
                                sx={{ maxHeight: '100%', overflow: 'auto' }}
                                elevation={6}
                            >
                                <ProductTable>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>S.NO</TableCell>
                                            <TableCell>Order ID</TableCell>
                                            <TableCell>Order Date</TableCell>
                                            <TableCell>
                                                Order TimeStamp
                                            </TableCell>
                                            <TableCell>Order Status</TableCell>
                                            <TableCell>
                                                Buyback Category
                                            </TableCell>
                                            <TableCell>Partner ID</TableCell>
                                            <TableCell>Partner Email</TableCell>
                                            <TableCell>Partner Shop</TableCell>
                                            <TableCell>Item ID</TableCell>
                                            <TableCell>
                                                Old Item Details
                                            </TableCell>
                                            <TableCell>IMEI</TableCell>
                                            <TableCell>GEP Order</TableCell>
                                            <TableCell>
                                                Base Disscount
                                            </TableCell>
                                            <TableCell>Diganostic</TableCell>
                                            <TableCell>
                                                Partner Purchase Price
                                            </TableCell>
                                            <TableCell>Tracking ID</TableCell>
                                            <TableCell>Delivery Date</TableCell>
                                            <TableCell>
                                                Order ID Replaced
                                            </TableCell>
                                            <TableCell>
                                                Deliverd With OTP
                                            </TableCell>
                                            <TableCell>
                                                Deliverd With Bag Exception
                                            </TableCell>
                                            <TableCell>
                                                GC Amount Redeemed
                                            </TableCell>
                                            <TableCell>
                                                GC Amount Refund
                                            </TableCell>
                                            <TableCell>
                                                GC Redeem Time
                                            </TableCell>
                                            <TableCell>
                                                GC Amount Refund Time
                                            </TableCell>
                                            <TableCell>
                                                Diagonstic Status
                                            </TableCell>
                                            <TableCell>VC Eligible</TableCell>
                                            <TableCell>
                                                Customer Declaration Physical
                                                Defect Present
                                            </TableCell>
                                            <TableCell>
                                                Customer Declaration Physical
                                                Defect Type
                                            </TableCell>
                                            <TableCell>
                                                Partner Price No Defect
                                            </TableCell>
                                            <TableCell>
                                                Revised Partner Price
                                            </TableCell>
                                            <TableCell>Delivery Fee</TableCell>
                                            <TableCell>
                                                Exchange Facilitation Fee
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {item.map((data, index) => (
                                            <TableRow key={data.id}>
                                                <TableCell scope="row">
                                                    {data.id}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="order_id"
                                                        value={data.order_id}
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.order_id_is_duplicate?.includes(
                                                        data['order_id']
                                                    ) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['order_id'] ==
                                                            undefined) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['order_id'] ==
                                                            '') ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}

                                                    {err?.order_id_is_duplicate?.includes(
                                                        data['order_id']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Order Id Is
                                                            Duplicate
                                                        </p>
                                                    ) : (Object.keys(err)
                                                          .length != 0 &&
                                                          data['order_id'] ==
                                                              undefined) ||
                                                      (Object.keys(err)
                                                          .length != 0 &&
                                                          data['order_id'] ==
                                                              '') ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Order Does Not Exist
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="order_date"
                                                        value={new Date(
                                                            data?.order_date
                                                        ).toLocaleString(
                                                            'en-GB',
                                                            {
                                                                year: 'numeric',
                                                                month: '2-digit',
                                                                day: '2-digit',
                                                            }
                                                        )}
                                                    />
                                                    {err?.order_date?.includes(
                                                        data['order_date']
                                                    ) ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {err?.order_date?.includes(
                                                        data['order_date']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Invalid order date
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="order_timestamp"
                                                        value={
                                                            data.order_timestamp
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.order_timestamp?.includes(
                                                        data['order_timestamp']
                                                    ) ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {err?.order_timestamp?.includes(
                                                        data['order_timestamp']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Invalid date
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="order_status"
                                                        value={
                                                            data.order_status
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {Object.keys(err).length !=
                                                        0 &&
                                                    data.order_status !==
                                                        'NEW' ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {Object.keys(err).length !=
                                                        0 &&
                                                    data.order_status !==
                                                        'NEW' ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Not a new order
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="buyback_category"
                                                        value={
                                                            data.buyback_category
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {' '}
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="partner_id"
                                                        value={data.partner_id}
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.partner_id_does_not_exist?.includes(
                                                        data['partner_id']
                                                    ) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['partner_id'] ==
                                                            undefined) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['partner_id'] ==
                                                            '') ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {err?.partner_id_does_not_exist?.includes(
                                                        data['partner_id']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Partner Id Does Not
                                                            Exist
                                                        </p>
                                                    ) : (Object.keys(err)
                                                          .length != 0 &&
                                                          data['partner_id'] ==
                                                              undefined) ||
                                                      (Object.keys(err)
                                                          .length != 0 &&
                                                          data['partner_id'] ==
                                                              '') ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Partner Id Does Not
                                                            Exist
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="partner_email"
                                                        value={
                                                            data.partner_email
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="partner_shop"
                                                        value={
                                                            data.partner_shop
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.location_does_not_exist?.includes(
                                                        data['partner_shop']
                                                    ) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['partner_shop'] ==
                                                            undefined) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['partner_shop'] ==
                                                            '') ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}

                                                    {err?.location_does_not_exist?.includes(
                                                        data['partner_shop']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            You can't add this
                                                            data
                                                        </p>
                                                    ) : Object.keys(err)
                                                          .length != 0 &&
                                                      data['partner_shop'] ==
                                                          undefined ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Location Does Not
                                                            Exist
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="item_id"
                                                        value={data.item_id}
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.item_id_does_not_exist?.includes(
                                                        data['item_id']
                                                    ) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['item_id'] ==
                                                            undefined) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['item_id'] ==
                                                            '') ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {err?.item_id_does_not_exist?.includes(
                                                        data['item_id']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Item Id Does Not
                                                            Exist
                                                        </p>
                                                    ) : (Object.keys(err)
                                                          .length != 0 &&
                                                          data['item_id'] ==
                                                              undefined) ||
                                                      (Object.keys(err)
                                                          .length != 0 &&
                                                          data['item_id'] ==
                                                              '') ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Item Id Does Not
                                                            Exist
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="old_item_details"
                                                        value={
                                                            data[
                                                                'old_item_details'
                                                            ]
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.brand_name_does_not_exist?.includes(
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[0]
                                                    ) ||
                                                    err?.model_name_does_not_exist?.includes(
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[1]
                                                    ) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[0] ==
                                                            undefined) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[0] ==
                                                            '') ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : err?.model_name_does_not_exist?.includes(
                                                          data[
                                                              'old_item_details'
                                                          ]?.split(':')[1]
                                                      ) ||
                                                      (Object.keys(err)
                                                          .length != 0 &&
                                                          data[
                                                              'old_item_details'
                                                          ]?.split(':')[1] ==
                                                              undefined) ||
                                                      (Object.keys(err)
                                                          .length != 0 &&
                                                          data[
                                                              'old_item_details'
                                                          ]?.split(':')[1] ==
                                                              '') ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {err?.brand_name_does_not_exist?.includes(
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[0]
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            This Brand Name Does
                                                            Not Exist
                                                        </p>
                                                    ) : err?.model_name_does_not_exist?.includes(
                                                          data[
                                                              'old_item_details'
                                                          ]?.split(':')[1]
                                                      ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Model Name Does Not
                                                            Exist
                                                        </p>
                                                    ) : (Object.keys(err)
                                                          .length != 0 &&
                                                          data[
                                                              'old_item_details'
                                                          ]?.split(':')[0] ==
                                                              undefined) ||
                                                      (Object.keys(err)
                                                          .length != 0 &&
                                                          data[
                                                              'old_item_details'
                                                          ]?.split(':')[0] ==
                                                              '') ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            This Brand Name Does
                                                            Not Exist
                                                        </p>
                                                    ) : (Object.keys(err)
                                                          .length != 0 &&
                                                          data[
                                                              'old_item_details'
                                                          ]?.split(':')[1] ==
                                                              undefined) ||
                                                      (Object.keys(err)
                                                          .length != 0 &&
                                                          data[
                                                              'old_item_details'
                                                          ]?.split(':')[1] ==
                                                              '') ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Model Name Does Not
                                                            Exist
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {' '}
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="imei"
                                                        value={data.imei}
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.imei_number_is_duplicate?.some(
                                                        (d) =>
                                                            d.imei ==
                                                                data['imei'] &&
                                                            d.status ==
                                                                data.order_status
                                                    ) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['imei'] ==
                                                            undefined) ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['imei'] == '') ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {err?.imei_number_is_duplicate?.includes(
                                                       data['imei']?.toString()
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Invalid IMEI number
                                                        </p>
                                                    ) : (Object.keys(err)
                                                          .length != 0 &&
                                                          data['imei'] ==
                                                              undefined) ||
                                                      (Object.keys(err)
                                                          .length != 0 &&
                                                          data['imei'] ==
                                                              '') ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                             Invalid IMEI number
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {' '}
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="gep_order"
                                                        value={data.gep_order}
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="base_discount"
                                                        value={
                                                            data[
                                                                'base_discount'
                                                            ]
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        id="outlined-password-input"
                                                        type="text"
                                                        name="diagnostic"
                                                        value={data.diagnostic}
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="partner_purchase_price"
                                                        value={
                                                            data.partner_purchase_price
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="tracking_id"
                                                        value={data.tracking_id}
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.tracking_id?.includes(
                                                        data['tracking_id']
                                                    ) ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}

                                                    {err?.tracking_id?.includes(
                                                        data['tracking_id']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Tracking Id Must Be
                                                            12 Digits
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        id="outlined-password-input"
                                                        name="delivery_date"
                                                        value={
                                                            data.delivery_date
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.delivery_date?.includes(
                                                        data['delivery_date']
                                                    ) ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {err?.delivery_date?.includes(
                                                        data['delivery_date']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Invalid order date
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="order_id_replaced"
                                                        value={
                                                            data.order_id_replaced
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="deliverd_with_otp"
                                                        value={
                                                            data.deliverd_with_otp
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="deliverd_with_bag_exception"
                                                        value={
                                                            data.deliverd_with_bag_exception
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="gc_amount_redeemed"
                                                        value={
                                                            data.gc_amount_redeemed
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="gc_amount_refund"
                                                        value={
                                                            data.gc_amount_refund
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="gc_redeem_time"
                                                        value={
                                                            data.gc_redeem_time
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                    {err?.gc_redeem_time?.includes(
                                                        data['gc_redeem_time']
                                                    ) ? (
                                                        <ClearIcon
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        />
                                                    ) : Object.keys(err)
                                                          .length != 0 ? (
                                                        <DoneIcon
                                                            style={{
                                                                color: 'green',
                                                            }}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                    {err?.gc_redeem_time?.includes(
                                                        data['gc_redeem_time']
                                                    ) ? (
                                                        <p
                                                            style={{
                                                                color: 'red',
                                                            }}
                                                        >
                                                            Invalid date
                                                        </p>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="gc_amount_refund_time"
                                                        value={
                                                            data.gc_amount_refund_time
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="diagnstic_status"
                                                        value={
                                                            data.diagnstic_status
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="vc_eligible"
                                                        value={data.vc_eligible}
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="customer_declaration_physical_defect_present"
                                                        value={
                                                            data.customer_declaration_physical_defect_present
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="customer_declaration_physical_defect_type"
                                                        value={
                                                            data.customer_declaration_physical_defect_type
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="partner_price_no_defect"
                                                        value={
                                                            data.partner_price_no_defect
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="revised_partner_price"
                                                        value={
                                                            data.revised_partner_price
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="delivery_fee"
                                                        value={
                                                            data.delivery_fee
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        onChange={updateFieldChanged(
                                                            data.delet_id
                                                        )}
                                                        name="exchange_facilitation_fee"
                                                        value={
                                                            data.exchange_facilitation_fee
                                                        }
                                                        inputProps={{
                                                            style: {
                                                                width: 'auto',
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {(Object.keys(err).length !=
                                                        0 &&
                                                        data.order_status !==
                                                            'NEW') ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['partner_id'] ==
                                                            '') ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['order_id'] ==
                                                            '') ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['partner_shop'] ==
                                                            '') ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['item_id'] ==
                                                            '') ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[0] ==
                                                            '') ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[1] ==
                                                            '') ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['imei'] == '') ||
                                                    err?.order_date?.includes(
                                                        data['order_date']
                                                    ) ||
                                                    err?.order_timestamp?.includes(
                                                        data['order_timestamp']
                                                    ) ||
                                                    err?.delivery_date?.includes(
                                                        data['delivery_date']
                                                    ) ||
                                                    err?.gc_redeem_time?.includes(
                                                        data['gc_redeem_time']
                                                    ) ||
                                                    err?.order_id_is_duplicate?.includes(
                                                        data['order_id']
                                                    ) == true ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['order_id'] ==
                                                            undefined) ||
                                                    err?.partner_id_does_not_exist?.includes(
                                                        data['partner_id']
                                                    ) == true ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['partner_id'] ==
                                                            undefined) ||
                                                    err?.location_does_not_exist?.includes(
                                                        data['partner_shop']
                                                    ) == true ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['partner_shop'] ==
                                                            undefined) ||
                                                    err?.item_id_does_not_exist?.includes(
                                                        data['item_id']
                                                    ) == true ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['item_id'] ==
                                                            undefined) ||
                                                    err?.brand_name_does_not_exist?.includes(
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[0]
                                                    ) == true ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[0] ==
                                                            undefined) ||
                                                    err?.model_name_does_not_exist?.includes(
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[1]
                                                    ) == true ||
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data[
                                                            'old_item_details'
                                                        ]?.split(':')[1] ==
                                                            undefined) ||
                                                   
                                                    (Object.keys(err).length !=
                                                        0 &&
                                                        data['imei'] ==
                                                            undefined) ? (
                                                        <Button
                                                            sx={{
                                                                ml: 2,
                                                            }}
                                                            variant="contained"
                                                            style={{
                                                                backgroundColor:
                                                                    'red',
                                                            }}
                                                            component="span"
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        'You Want to Remove?'
                                                                    )
                                                                ) {
                                                                    handelDelete(
                                                                        data.delet_id
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    ) : (
                                                        ''
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </ProductTable>
                            </Box>
                            {pagination.item.length != 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'end',
                                        mt: 1,
                                        mr: 3,
                                        ml: 3,
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        sx={{ m: 1 }}
                                        disabled={pagination.page === 1}
                                        style={{ backgroundColor: '#206CE2' }}
                                        onClick={(e) =>
                                            setPagination((p) => ({
                                                ...p,
                                                page: --p.page,
                                            }))
                                        }
                                    >
                                        Previous
                                    </Button>

                                    <h6 style={{ marginTop: '19px' }}>
                                        {pagination.page}/{pagination.totalPage}
                                    </h6>
                                    <Button
                                        variant="contained"
                                        sx={{ m: 1 }}
                                        disabled={
                                            pagination.page ===
                                            pagination.totalPage
                                        }
                                        style={{ backgroundColor: '#206CE2' }}
                                        onClick={(e) =>
                                            setPagination((p) => ({
                                                ...p,
                                                page: ++p.page,
                                            }))
                                        }
                                    >
                                        Next
                                    </Button>
                                </Box>
                            ) : null}
                        </>
                    ) : item.length != 0 ? (
                        <StyledLoading>
                            <Box position="relative">
                                <img
                                    src="/assets/images/logo-circle.svg"
                                    alt=""
                                />
                                <CircularProgress className="circleProgress">
                                    <p>Please Wait...</p>
                                </CircularProgress>
                            </Box>
                        </StyledLoading>
                    ) : null}
                </>
            </SimpleCard>
        </Container>
    )
}

export default PaginationTable
