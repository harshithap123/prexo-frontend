import jwt_decode from 'jwt-decode'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect, useMemo } from 'react'
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
    TableFooter,
    MenuItem,
    Box,
    TextField,
    Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { axiosMisUser } from '../../../../axios'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'
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
    const [rowsPerPage, setRowsPerPage] = React.useState(100)
    const [data, setData] = useState([])
    const navigate = useNavigate()
    const [count, setCount] = useState('')
    const [refresh, setRefresh] = useState(false)
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
                    let obj = {
                        location: location,
                        page: page,
                        rowsPerPage: rowsPerPage,
                    }
                    let res = await axiosMisUser.post('/getBadDelivery', obj)
                    if (res.status == 200) {
                        setDisplayText('')
                        setCount(res.data.count)
                        setItem(res.data.data)
                    } else {
                        setCount(res.data.count)
                        setDisplayText('Sorry no data found')
                        setItem(res.data.data)
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const ProductTable = styled(Table)(() => ({
        minWidth: 750,
        width: '150px',
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
            paddingLeft: '36px !important',
        },
    }))

    const download = (e) => {
        const fileExtension = '.xlsx'
        const fileType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        const ws = XLSX.utils.json_to_sheet(item)
        ws['!cols'] = []
        ws['!cols'][0] = { hidden: true }
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: fileType })
        FileSaver.saveAs(data, 'bad-orders' + fileExtension)
    }

    const searchDelivery = async (e) => {
        e.preventDefault()

        try {
            let admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                setDisplayText('Searching...')
                let { location } = jwt_decode(admin)
                if (e.target.value == '') {
                    setRefresh((refresh) => !refresh)
                } else if (search.type == '') {
                    Swal.fire({
                        position: 'top-center',
                        icon: 'warning',
                        title: 'Please Add Input',
                        confirmButtonText: 'Ok',
                    })
                } else {
                    let obj = {
                        location: location,
                        type: search.type,
                        searchData: e.target.value,
                    }
                    let res = await axiosMisUser.post('/searchBadDelivery', obj)
                    if (res.status == 200) {
                        setRowsPerPage(10)
                        setPage(0)
                        setDisplayText('')

                        setItem(res.data.data)
                    } else {
                        setItem(res.data.data)
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

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Delivery', path: '/' },
                        { name: 'Bad-Delivery' },
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
                        <MenuItem value="imei">IMEI</MenuItem>
                        <MenuItem value="tracking_id">Tracking ID</MenuItem>
                        <MenuItem value="item_id">Item ID</MenuItem>
                    </TextField>
                    <TextField
                        onChange={(e) => {
                            searchDelivery(e)
                        }}
                        disabled={search.type == '' ? true : false}
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
                <ProductTable>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'150px'}}>Record.NO</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Delivery Imported Date</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Tracking ID</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Order ID</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Order Date</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Item ID</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>GEP Order</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>IMEI</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Partner Purchase Price</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Partner Shop</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Base Discount</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Diagnostics Discount</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Storage Disscount</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Buyback Category</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Doorsteps Diagnostics</TableCell>
                            <TableCell sx={{fontWeight:'bold', fontSize:'16px', width:'200px'}}>Delivered Date</TableCell>
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
                                <TableCell>{data.id}</TableCell>
                                <TableCell>
                                    {new Date(data.created_at).toLocaleString(
                                        'en-GB',
                                        {
                                            hour12: true,
                                        }
                                    )}
                                </TableCell>
                                <TableCell>
                                    {data.tracking_id?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data.order_id?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.order_date == null
                                        ? ''
                                        : new Date(
                                              data?.order_date
                                          ).toLocaleString('en-GB', {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                          }) == 'Invalid Date'
                                        ? data?.order_date
                                        : new Date(
                                            data?.order_date
                                          ).toLocaleString('en-GB', {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                          })}
                                </TableCell>
                                <TableCell>
                                    {data.item_id?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data.gep_order?.toString()}
                                </TableCell>
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
                                <TableCell>
                                    {new Date(
                                        data?.delivery_date
                                    ).toLocaleString('en-GB', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </TableCell>
                                <TableCell style={{ color: 'red' }}>
                                    {data?.reason?.join(', ')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </ProductTable>
                </Card>
                <>
                    <TablePagination
                        sx={{ px: 2 }}
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={item.length}
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
