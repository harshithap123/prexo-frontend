import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import AssignDialogBox from './assign-dialog'
import { styled } from '@mui/system'
import { Button, Box, Typography, Table, TableContainer } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import jwt_decode from 'jwt-decode'
import { axiosMisUser } from '../../../../../axios'
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
    const [bagList, setBotBag] = useState([])
    const navigate = useNavigate()
    const [botUsers, setBotUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [shouldOpenEditorDialog, setShouldOpenEditorDialog] = useState(false)
    const [bagId, setBagId] = useState('')

    useEffect(() => {
        try {
            let user = localStorage.getItem('prexo-authentication')
            if (user) {
                setIsLoading(true)
                let { location } = jwt_decode(user)
                const fetchData = async () => {
                    let res = await axiosMisUser.post('/getStockin/' + location)
                    if (res.status == 200) {
                        setIsLoading(false)
                        setBotBag(res.data.data)
                    }
                }
                fetchData()
            }
        } catch (error) {
            setIsLoading(false)
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
            })
        }
        return () => {
            setIsAlive(false)
            setIsLoading(false)
        }
    }, [isAlive])

    const handleDialogClose = () => {
        setBagId('')
        setBotUsers([])
        setShouldOpenEditorDialog(false)
    }

    const handleDialogOpen = () => {
        setShouldOpenEditorDialog(true)
    }

    const handelAssign = (id) => {
        try {
            const fetchData = async () => {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    let { location } = jwt_decode(admin)
                    let res = await axiosMisUser.post('/getBot/' + location)
                    if (res.status == 200) {
                        setBagId(id)
                        setBotUsers(res.data.data)
                        handleDialogOpen()
                    }
                } else {
                    navigate('/')
                }
            }
            fetchData()
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
            })
        }
    }

    const columns = [
        {
            name: 'index',
            label: <Typography variant="subtitle1" fontWeight='bold' sx={{marginLeft:'7px'}}><>Record No</></Typography>,
            options: {
                filter: false,
                sort: false,
                // setCellProps: () => ({ align: 'center' }),
                customBodyRender: (rowIndex, dataIndex) =>
                <Typography sx={{pl:4}}>{dataIndex.rowIndex + 1}</Typography>
            },
        },
        {
            name: 'code',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Bag ID</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'sort_id',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Status</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'status_change_time',
            label: <Typography variant="subtitle1" fontWeight='bold' ><>Date of Closure</></Typography>,
            options: {
                filter: true,
                customBodyRender: (value) =>
                    new Date(value).toLocaleString('en-GB', {
                        hour12: true,
                    }),
            },
        },
        {
            name: 'limit',
            label: <Typography variant="subtitle1" fontWeight='bold' ><>Max</></Typography>,
            options: {
                // setCellProps: () => ({ align: 'center' }),
                filter: true,
            },
        },
        {
            name: 'items',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Valid</></Typography>,
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value.filter(function (item) {
                        return item.status == 'Valid'
                    }).length,
            },
        },
        {
            name: 'items',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Invalid</></Typography>,
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value.filter(function (item) {
                        return item.status == 'Invalid'
                    }).length,
            },
        },
        {
            name: 'items',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Duplicate</></Typography>,
            options: {
                filter: true,

                customBodyRender: (value, dataIndex) =>
                    value.filter(function (item) {
                        return item.status == 'Duplicate'
                    }).length,
            },
        },

        {
            name: 'items',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Total</></Typography>,
            options: {
                filter: true,

                customBodyRender: (value, dataIndex) => value.length,
            },
        },
        {
            name: 'sort_id',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Action</></Typography>,
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <>
                            {value === 'Closed' ||
                            value === 'Pre-closure' ||
                            value === 'In Progress' ? (
                                <Button
                                    sx={{
                                        m: 1,
                                    }}
                                    disabled={value == 'In Progress'}
                                    variant="contained"
                                    onClick={() => {
                                        handelAssign(tableMeta.rowData[1])
                                    }}
                                    style={{ backgroundColor: 'green' }}
                                >
                                    Assign
                                </Button>
                            ) : (
                                <Button
                                    sx={{
                                        m: 1,
                                    }}
                                    disabled
                                    variant="contained"
                                    style={{ backgroundColor: 'green' }}
                                    meadium
                                >
                                    Assigned
                                </Button>
                            )}
                            <Button
                                fullWidth
                                sx={{
                                    m: 1,
                                    width:'77px'
                                }}
                                variant="contained"
                                style={{ backgroundColor: 'primery' }}
                                component="span"
                                onClick={() => {
                                    navigate(
                                        '/mis/assign-to-agent/bot/uic-genaration/' +
                                            tableMeta.rowData[1]
                                    )
                                }}
                            >
                                UIC
                            </Button>
                        </>
                    )
                },
            },
        },
    ]

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Assign-to-agent', path: '/' },
                        { name: 'BOT' },
                    ]}
                />
            </div>

            <ScrollableTableContainer>
                <ProductTable>
                <MUIDataTable
                title={'Bot Bag'}
                data={bagList}
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
                    selectableRows: 'none', // set checkbox for each row
                    // search: false, // set search option
                    // filter: false, // set data filter option
                    // download: false, // set download option
                    // print: false, // set print option
                    // pagination: true, //set pagination option
                    // viewColumns: false, // set column option
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

                    elevation: 0,
                    rowsPerPageOptions: [10, 20, 40, 80, 100],
                }}
            />
                </ProductTable>
            </ScrollableTableContainer>
            
            {shouldOpenEditorDialog && (
                <AssignDialogBox
                    handleClose={handleDialogClose}
                    open={handleDialogOpen}
                    setIsAlive={setIsAlive}
                    botUsers={botUsers}
                    setBotUsers={setBotUsers}
                    bagId={bagId}
                />
            )}
        </Container>
    )
}

export default SimpleMuiTable
