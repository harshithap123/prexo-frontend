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
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    setIsLoading(true)
                    let { location } = jwt_decode(admin)
                    let response = await axiosWarehouseIn.post(
                        '/billedBin/report/' + location
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
            name: 'uic_code',
            label: 'UIC',
            options: {
                filter: true,
                customBodyRender: (value, tableMeta) => value.code,
            },
        },
        {
            name: 'imei',
            label: 'Imei',
            options: {
                filter: true,
            },
        },
        {
            name: 'products',
            label: 'Muic',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.[0]?.muic || '',
            },
        },
        {
            name: 'products',
            label: 'Brand',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.[0]?.brand_name || '',
            },
        },
        {
            name: 'products',
            label: 'Model',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.[0]?.model_name || '',
            },
        },

        {
            name: 'bqc_software_report',
            label: 'Grade',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.final_grade || '',
            },
        },

        {
            name: 'stx_tray_id',
            label: 'Moved From Stx',
            options: {
                filter: true,
            },
        },
        {
            name: 'item_moved_to_billed_bin_date',
            label: 'Moved Date',
            options: {
                filter: true,
                customBodyRender: (value) =>
                new Date(value).toLocaleString('en-GB', {
                    hour12: true,
                }),
            },
        },
        {
            name: 'item_moved_to_billed_bin_done_username',
            label: 'Moved By Agent',
            options: {
                filter: true,
                
            },
        },
    ]

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[{ name: 'Report', path: '/' },
                    { name: 'Billed Bin' },]}
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
