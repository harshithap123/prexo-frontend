import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { useNavigate } from 'react-router-dom'
import { axiosAuditAgent } from '../../../../axios'
import jwt_decode from 'jwt-decode'
import { Button, Typography } from '@mui/material'
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
    const [trayData, setTrayData] = useState([])
    const [submitButDis, setSubmitButDis] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                let token = localStorage.getItem('prexo-authentication')
                if (token) {
                    const { user_name } = jwt_decode(token)
                    let res = await axiosAuditAgent.post(
                        '/getAssignedOtherTray/' + user_name
                    )
                    if (res.status == 200) {
                        setTrayData(res.data.data)
                    }
                } else {
                    navigate('/')
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                })
            }
        }
        fetchData()
        return () => setIsAlive(false)
    }, [isAlive])

    const handelViewTray = (e, id) => {
        e.preventDefault()
        navigate('/audit/assigned-tray/view-item/' + id)
    }
    const handelClose = async (e, id) => {
        e.preventDefault()
        try {
            setSubmitButDis(true)
            let res = await axiosAuditAgent.post('/trayClose/' + id)
            if (res.status == 200) {
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: res?.data?.message,
                    confirmButtonText: 'Ok',
                })
                setSubmitButDis(false)
                setIsAlive((isAlive) => !isAlive)
            } else {
                setSubmitButDis(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: res?.data?.message,
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

    const columns = [
        {
            name: 'index',
            label: <Typography variant="subtitle1" fontWeight='bold' sx={{ml:2}}><>Record No</></Typography>,
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) =>
                <Typography sx={{pl:4}}>{dataIndex.rowIndex + 1}</Typography>
            },
        },
        {
            name: 'code',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Tray ID</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'limit',
            label: 'Tray Id',
            options: {
                filter: false,
                sort: false,
                display: false,
            },
        },
        {
            name: 'items',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Quantity</></Typography>,
            options: {
                filter: false,
                customBodyRender: (value, tableMeta) =>
                    value?.length + '/' + tableMeta?.rowData[2],
            },
        },
        {
            name: 'type_taxanomy',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Tray Type</></Typography>,
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
            name: 'assigned_date',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Assigned Date</></Typography>,
            options: {
                filter: true,
                customBodyRender: (value) =>
                    new Date(value).toLocaleString('en-GB', {
                        hour12: true,
                    }),
            },
        },
        {
            name: 'code',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Action</></Typography>,
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value) => {
                    return (
                        <>
                            <Button
                                sx={{
                                    m: 1,
                                }}
                                variant="contained"
                                onClick={(e) => {
                                    handelViewTray(e, value)
                                }}
                                style={{ backgroundColor: 'primery' }}
                            >
                                View
                            </Button>
                            <Button
                                sx={{
                                    m: 1,
                                }}
                                disabled={submitButDis}
                                variant="contained"
                                onClick={(e) => {
                                    if (window.confirm('You want to Close?')) {
                                        handelClose(e, value)
                                    }
                                }}
                                style={{ backgroundColor: 'red' }}
                            >
                                Close
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
                    routeSegments={[{ name: 'Assigned Tray', path: '/' }]}
                />
            </div>

            <MUIDataTable
                title={'Tray'}
                data={trayData}
                columns={columns}
                options={{
                    filterType: 'textField',
                    responsive: 'simple',
                    download: false,
                    print: false,
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
        </Container>
    )
}

export default SimpleMuiTable
