import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { Button, Checkbox, Typography, Table, TableContainer } from '@mui/material'
import Swal from 'sweetalert2'
import jwt_decode from 'jwt-decode'
import { axiosWarehouseIn } from '../../../../../axios'
import { useNavigate } from 'react-router-dom'

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
    minWidth: 750,
    width: '130%',
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

const ScrollableTableContainer = styled(TableContainer)
`overflow-x: auto`;

const SimpleMuiTable = () => {
    const [isAlive, setIsAlive] = useState(true)
    const [isCheck, setIsCheck] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [ctxTrayList, setCtxTrayList] = useState([])
    const [userCpcType, setUserCpcType] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchWht = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    setIsLoading(true)
                    let { location, cpc_type } = jwt_decode(admin)
                    setUserCpcType(cpc_type)
                    let res = await axiosWarehouseIn.post(
                        '/ctxTray/' + 'Transferred to Sales/' + location
                    )
                    if (res.status === 200) {
                        setIsLoading(false)
                        setCtxTrayList(res.data.data)
                    }
                }
            } catch (error) {
                setIsLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                })
            }
        }
        fetchWht()
        return () => setIsAlive(false)
    }, [isAlive])

    const handleClick = (e) => {
        const { id, checked } = e.target
        setIsCheck([...isCheck, id])
        if (!checked) {
            setIsCheck(isCheck.filter((item) => item !== id))
        }
    }

    const handelReceive = async () => {
        try {
            let obj = {
                ischeck: isCheck,
                page: 'Mis-ctx-receive',
            }
            if (userCpcType == 'Sales') {
                obj.sortId = 'Accepted From Processing'
            } else {
                obj.sortId = 'Accepted From Sales'
            }
            let res = await axiosWarehouseIn.post(
                '/ctx/transferRequest/approve',
                obj
            )
            setIsCheck([])
            if (res.status === 200) {
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: res.data.message,
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        setIsCheck([])
                        setIsAlive((isAlive) => !isAlive)
                    }
                })
            } else if (res.status == 202) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    title: res?.data?.message,
                    confirmButtonText: 'Ok',
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
            })
        }
    }

    const handelViewItem = (trayId) => {
        navigate('/sup-admin/wht/view-item/' + trayId)
    }

    const columns = [
        {
            name: 'code',
            label: <Typography variant="subtitle1" fontWeight='bold' sx={{marginLeft:'7px'}}><>Select</></Typography>,
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, dataIndex) => {
                    return (
                        <Checkbox
                            onClick={(e) => {
                                handleClick(e)
                            }}
                            id={value}
                            key={value}
                            checked={isCheck.includes(value)}
                        />
                    )
                },
            },
        },
        {
            name: 'index',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Record No</></Typography>,
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) =>
                <Typography sx={{pl:4}}>{dataIndex.rowIndex + 1}</Typography>
            },
        },
        {
            name: 'code', // field name in the row object
            label: <Typography variant="subtitle1" fontWeight='bold'><>Tray ID</></Typography>, // column title that will be shown in table
            options: {
                filter: true,
            },
        },
        {
            name: 'warehouse',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Warehouse</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'type_taxanomy',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Tray Category</></Typography>,
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: 'brand',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Brand</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'model',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Model</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'name',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Tray Name</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'limit',
            label: 'Limit',
            options: {
                filter: false,
                sort: false,
                display: false,
            },
        },
        {
            name: 'name',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Name</></Typography>,
            hide: true,
            options: {
                filter: true,
            },
        },
        {
            name: 'items',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Quantity</></Typography>,
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta) =>
                    value.length + '/' + tableMeta.rowData[8],
            },
        },
        {
            name: 'display',
            label: <Typography variant="subtitle1" fontWeight='bold' noWrap><>Tray Display</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'sort_id',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Status</></Typography>,
            options: {
                filter: false,
                sort: false,
            },
        },
        {
            name: 'code',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Action</></Typography>,
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <Button
                            sx={{
                                m: 1,
                            }}
                            variant="contained"
                            onClick={() => handelViewItem(value)}
                            style={{ backgroundColor: 'green' }}
                            component="span"
                        >
                            View
                        </Button>
                    )
                },
            },
        },
    ]

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[{ name: 'CTX Receive', path: '/' }]}
                />
            </div>
            <Button
                sx={{ mb: 2 }}
                variant="contained"
                color="primary"
                disabled={isCheck.length === 0}
                onClick={(e) => {
                    handelReceive(e)
                }}
            >
                Accept
            </Button>
            <ScrollableTableContainer>
                <ProductTable>
                <MUIDataTable
                title={'CTX Tray'}
                data={ctxTrayList}
                columns={columns}
                options={{
                    filterType: 'textField',
                    responsive: 'simple',
                    download: false,
                    print: false,
                    textLabels: {
                        body: {
                            noMatch: isLoading
                                ? 'Loading...'
                                : 'Sorry, there is no matching data to display',
                        },
                    },
                    customSort: (data, colIndex, order) => {
                        return data.sort((a, b) => {
                            if (colIndex === 1) {
                                return (
                                    (a.data[colIndex].price <
                                    b.data[colIndex].price
                                        ? -1
                                        : 1) * (order === 'desc' ? 1 : -1)
                                )
                            }
                            return (
                                (a.data[colIndex] < b.data[colIndex] ? -1 : 1) *
                                (order === 'desc' ? 1 : -1)
                            )
                        })
                    },
                    selectableRows: 'none', // set checkbox for each row
                    // search: false, // set search option
                    // filter: false, // set data filter option
                    // download: false, // set download option
                    // print: false, // set print option
                    // pagination: true, //set pagination option
                    // viewColumns: false, // set column option
                    elevation: 0,
                    rowsPerPageOptions: [10, 20, 40, 80, 100],
                }}
            />
                </ProductTable>
            </ScrollableTableContainer>
            
        </Container>
    )
}

export default SimpleMuiTable
