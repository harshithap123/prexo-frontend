import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { useNavigate } from 'react-router-dom'
import jwt_decode from 'jwt-decode'
import { axiosWarehouseIn } from '../../../../axios'
import { Button } from '@mui/material'
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
    const [item, setItem] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const [userName, setUserName] = useState('')
    const [butDisable, setButDisable] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    setIsLoading(true)
                    let { location, user_name } = jwt_decode(admin)
                    setUserName(user_name)
                    let response = await axiosWarehouseIn.post(
                        '/billedBin/' + location
                    )
                    if (response.status === 200) {
                        setIsLoading(false)
                        setItem(response.data.data)
                    }
                } else {
                    navigate('/')
                }
            } catch (error) {
                setIsLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    confirmButtonText: 'Ok',
                    text: error,
                })
            }
        }
        fetchData()
    }, [refresh])

    const handelMoviedToBillBin = async (id, uic) => {
        try {
            setButDisable(true)
            let obj = {
                trayId: id,
                uic: uic,
                username: userName,
            }
            const res = await axiosWarehouseIn.post('/movedToBilledBin', obj)
            if (res.status == 200) {
                
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: res?.data?.message,
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        setButDisable(false)
                        setRefresh((refresh) => !refresh)
                    }
                })
            } else {
                setButDisable(false)
                Swal.fire({
                    position: 'top-center',
                    icon: 'error',
                    title: res?.data?.message,
                    confirmButtonText: 'Ok',
                })
            }
        } catch (error) {
            alert(error)
        }
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
            name: 'items',
            label: 'UIC',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.uic || '',
            },
        },
        {
            name: 'items',
            label: 'Imei',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.imei || '',
            },
        },
        {
            name: 'items',
            label: 'Muic',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.muic || '',
            },
        },
        {
            name: 'items',
            label: 'Brand',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.brand_name || '',
            },
        },
        {
            name: 'items',
            label: 'Model',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.model_name || '',
            },
        },

        {
            name: 'tray_grade',
            label: 'Grade',
            options: {
                filter: true,
            },
        },

        {
            name: 'code',
            label: 'STX Tray Id',
            options: {
                filter: true,
            },
        },
        {
            name: 'code',
            label: 'Actions',
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
                            disabled={butDisable}
                            onClick={() => {
                                if (window.confirm('Item Need to Move?')) {
                                    handelMoviedToBillBin(
                                        value,
                                        tableMeta.rowData[1]?.uic
                                    )
                                }
                            }}
                            style={{ backgroundColor: 'green' }}
                            component="span"
                        >
                            Moved to Billed Bin
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
                    routeSegments={[{ name: 'Billed Bin', path: '/' }]}
                />
            </div>

            <MUIDataTable
                title={'Items'}
                data={item}
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
        </Container>
    )
}

export default SimpleMuiTable
