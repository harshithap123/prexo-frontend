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
    TableFooter,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { axiosMisUser } from '../../../../../axios'
import { useParams } from 'react-router-dom'
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
    const [isAlive, setIsAlive] = useState(true)
    const { bagId } = useParams()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                let res = await axiosMisUser.post('/getBagItemWithUic/' + bagId)
                if (res.status == 200) {
                    setItem(res.data.data)
                } else if (res.status == 202) {
                  
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text:res?.data?.message,
                    })
                    navigate(-1)
                }
            } catch (error) {
           
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text:error,
                })
            }
        }
        fetchData()
    }, [isAlive])

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
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
                icon: 'error',
                title: 'Oops...',
                text:'Please Select Atleast One Delivered Data',
            })
        } else {
            setLoading(true)
            let token = localStorage.getItem('prexo-authentication')
            if (token) {
                const { user_name } = jwt_decode(token)

                const addUic = async () => {
                    let count = 0
                    for (let i = 0; i < isCheck.length; i++) {
                        if (
                            item?.[0]?.delivery?.[isCheck[i]].uic_status !=
                            'Pending'
                        ) {
                          
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text:'Already UIC Created',
                            })

                            break
                        }
                        try {
                            let obj = {
                                _id: item?.[0]?.delivery?.[isCheck[i]]._id,
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
                                    icon: 'error',
                                    title: 'Oops...',
                                    text:res?.data?.message,
                                })
                            }
                        } catch (error) {
                         
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text:error,
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
                       
                        setLoading(false)
                        setIsCheck([])
                        setIsAlive((isAlive) => !isAlive)
                    }
                }
                addUic()
            }
        }
    }

    const fileType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const fileExtension = '.xlsx'

    const exportToCSV = (fileName) => {
        if (isCheck.length == 0) {
            
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text:'Please Select Atleast One Data',
            })
        } else {
            let arr = []
            let status = false
            let changeStatus = async () => {
                for (let i = 0; i < isCheck.length; i++) {
                    if (
                        item?.[0]?.delivery?.[isCheck[i]].uic_code == undefined
                    ) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text:'Please Generate UIC',
                        })
                        status = true
                        break
                    } else {
                        try {
                            let res = await axiosMisUser.post(
                                '/changeUicStatus/' +
                                    item?.[0]?.delivery?.[isCheck[i]]?._id
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
                                text:error,
                            })
                        }
                        let obj = {
                            UIC: item?.[0]?.delivery?.[isCheck[i]]?.uic_code
                                ?.code,
                            IMEI: item?.[0]?.delivery?.[
                                isCheck[i]
                            ]?.imei?.replace(/[^a-zA-Z0-9 ]/g, ''),
                            Model: item?.[0]?.delivery?.[
                                isCheck[i]
                            ]?.order_old_item_detail?.replace(
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

    const handleSelectAll = (e) => {
        setIsCheckAll(!isCheckAll)
        setIsCheck(item?.[0]?.delivery?.map((li, index) => index.toString()))
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

    const tableData = useMemo(() => {
        return (
            <ProductTable>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', ml:2, paddingTop:'15px', width:'150px'}}>
                            {' '}
                            <Checkbox
                                onClick={(e) => {
                                    handleSelectAll()
                                }}
                                checked={
                                    item?.[0]?.delivery?.length ==
                                    isCheck.length
                                        ? true
                                        : false
                                } 
                            />{' '}
                            Select All
                        </TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'100px'}}>Sl.No</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'150px'}}>UIC Status</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>UIC Generated Admin</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>UIC Generated Time</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'150px'}}>UIC Code</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>UIC Downloaded Time</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>Order ID</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>Tracking ID</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>Actual Delivery Date</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>Order Date</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>IMEI</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>Item ID</TableCell>
                        <TableCell sx={{fontSize:'16px', fontWeight:'bold', width:'200px'}}>Old Item Details</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {item?.[0]?.delivery?.map((data, index) => (
                        <TableRow tabIndex={-1}>
                            <TableCell>
                                {' '}
                                <Checkbox
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
                            <TableCell sx={{pl:2}}>{index + 1}</TableCell>
                            <TableCell
                                style={
                                    data?.uic_status == 'Pending'
                                        ? { color: 'red' }
                                        : data?.uic_status == 'Created'
                                        ? { color: 'orange' }
                                        : { color: 'green' }
                                }
                            >
                                {data?.uic_status}
                            </TableCell>
                            <TableCell>{data?.uic_code?.user}</TableCell>
                            <TableCell>
                                {' '}
                                {data?.uic_code?.created_at == undefined
                                    ? ''
                                    : new Date(
                                          data?.uic_code?.created_at
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
                            <TableCell>{data.order_id?.toString()}</TableCell>
                            <TableCell>
                                {data.tracking_id?.toString()}
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
                                {new Date(data.order_order_date).toLocaleString(
                                    'en-GB',
                                    {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    }
                                )}
                            </TableCell>
                            <TableCell>{data.imei?.toString()}</TableCell>
                            <TableCell>{data.item_id?.toString()}</TableCell>
                            <TableCell>
                                {data.order_old_item_detail?.toString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </ProductTable>
        )
    }, [isCheck, item])

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
            <Box>
                <Button
                    variant="contained"
                    sx={{ mb: 2, m: 1 }}
                    disabled={loading}
                    style={{ backgroundColor: 'primery' }}
                    onClick={(e) => {
                        handelUicGen(e)
                    }}
                >
                    Generate UIC
                </Button>
                <Button
                    variant="contained"
                    sx={{ mb: 2, m: 1 }}
                    onClick={(e) => {
                        exportToCSV('UIC-Printing-Sheet')
                    }}
                >
                    Download
                </Button>
            </Box>
            <Card sx={{ maxHeight: '100%', overflow: 'auto' }} elevation={6}>
                {tableData}
            </Card>
            <TableFooter>
                <TableRow>
                <TablePagination
                sx={{ px: 2 }}
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={item.length}
                rowsPerPage={rowsPerPage}
                page={page}
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
                </TableRow>
            </TableFooter>
           
        </Container>
    )
}

export default SimpleMuiTable
