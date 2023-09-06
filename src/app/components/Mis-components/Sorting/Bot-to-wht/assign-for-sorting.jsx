import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { Button, Box } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { axiosMisUser } from '../../../../../axios'
import jwt_decode from 'jwt-decode'
import AssignDialogBox from './assign-dailog'
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
    const [isAlive, setIsAlive] = useState(true)
    const [item, setItem] = useState({})
    const navigate = useNavigate()
    const [sortingAgent, setSortingAgent] = useState([])
    const { state } = useLocation()
    const [shouldOpenEditorDialog, setShouldOpenEditorDialog] = useState(false)
    const { isCheck, type } = state

    useEffect(() => {
        const fetchData = async () => {
            try {
                let obj = {
                    trayData: isCheck,
                }
                let res = await axiosMisUser.post('/assign-for-sorting', obj)
                if (res.status === 200) {
                    setItem(res.data.data)
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
        }
        fetchData()

        return () => setIsAlive(false)
    }, [isAlive])

    // NAVIGATE TO ASSIGN FOR SORTING PAGE
    const handelAssignForSorting = (e, code) => {
        e.preventDefault()
        navigate('/assign-for-sorting', {
            state: { isCheck: isCheck, type: 'Not From Request' },
        })
    }

    const handleDialogClose = () => {
        setSortingAgent([])
        setShouldOpenEditorDialog(false)
    }

    const handleDialogOpen = () => {
        setShouldOpenEditorDialog(true)
    }

    const handelViewDetailClub = (e, muic) => {
        e.preventDefault()
        navigate('/mis/sorting/bot-to-wht/assign-for-sorting/view-item', {
            state: { isCheck: isCheck, muic: muic },
        })
    }
    const handelAssignWht = (e, muic, whtTray) => {
        navigate('/mis/sorting/bot-to-wht/wht-assignment', {
            state: { isCheck: isCheck, muic: muic, whtTrayId: whtTray },
        })
    }

    const handelGetSortingUser = () => {
        const fetchData = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    let { location } = jwt_decode(admin)
                    let res = await axiosMisUser.post(
                        '/getSortingAgent/' + location
                    )
                    if (res.status === 200) {
                        setSortingAgent(res.data.data)
                        handleDialogOpen()
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
        fetchData()
    }

    const columns = [
        {
            name: 'index',
            label: 'Record No',
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) =>
                    dataIndex.rowIndex + 1,
            },
        },
        {
            name: 'muic',
            label: 'MUIC',
            options: {
                filter: true,
            },
        },

        {
            name: 'brand',
            label: 'Brand Name',
            options: {
                filter: true,
            },
        },
        {
            name: 'model',
            label: 'Model Name',
            options: {
                filter: true,
            },
        },
        {
            name: 'item',
            label: 'In BOT',
            options: {
                filter: true,
                customBodyRender: (value, tableMeta) => value.length,
            },
        },
        {
            name: 'wht_tray',
            label: 'Wht Tray',
            options: {
                filter: true,
                customBodyRender: (value, tableMeta) => value.join(', '),
            },
        },
        {
            name: 'assigned_count',
            label: 'action',
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <>
                            <Button
                                sx={{
                                    m: 1,
                                }}
                                variant="contained"
                                style={{ backgroundColor: '#206CE2' }}
                                onClick={(e) => {
                                    handelViewDetailClub(
                                        e,
                                        tableMeta.rowData[1]
                                    )
                                }}
                            >
                                View Item
                            </Button>
                            {type === 'Not From Request' ? (
                                <Button
                                    sx={{
                                        m: 1,
                                    }}
                                    variant="contained"
                                    style={{ backgroundColor: 'green' }}
                                    onClick={(e) => {
                                        handelAssignWht(
                                            e,
                                            tableMeta.rowData[1],
                                            tableMeta.rowData[1]
                                        )
                                    }}
                                >
                                    {tableMeta.rowData[4]?.length === value
                                        ? 'Tray Assigned'
                                        : ' Assign Tray'}
                                </Button>
                            ) : null}
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
                        { name: 'Sorting', path: '/' },
                        { name: 'Bot-to-wht' },
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
                    <h4>BOT Tray - {isCheck.toString()}</h4>
                </Box>
                <Box>
                    {type === 'Not From Request' ? (
                        <Box>
                            <Button
                                sx={{
                                    mb: 1,
                                }}
                                variant="contained"
                                style={{ backgroundColor: 'green' }}
                                component="span"
                                disabled={item.not_assigned}
                                onClick={(e) => {
                                    handelGetSortingUser()
                                }}
                            >
                                Select Sorting Agent
                            </Button>
                        </Box>
                    ) : null}
                </Box>
            </Box>

            <MUIDataTable
                title={'Wht Tray'}
                data={item.temp_array}
                columns={columns}
                options={{
                    filterType: 'textField',
                    responsive: 'simple',
                    download:false,
                    print:false,
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

            {shouldOpenEditorDialog && (
                <AssignDialogBox
                    handleClose={handleDialogClose}
                    open={handleDialogOpen}
                    setIsAlive={setIsAlive}
                    sortingAgent={sortingAgent}
                    isCheck={isCheck}
                />
            )}
        </Container>
    )
}

export default SimpleMuiTable
