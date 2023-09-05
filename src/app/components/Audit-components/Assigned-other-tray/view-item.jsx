import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { useParams } from 'react-router-dom'
import { axiosAuditAgent } from '../../../../axios'
import Swal from 'sweetalert2'
import { Typography } from '@mui/material'

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
    const [trayItem, setTrayItem] = useState([])
    const { trayId } = useParams()

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await axiosAuditAgent.post(
                    '/view-items/' + trayId
                )
                if (response.status === 200) {
                    setTrayItem(response.data.data.items)
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
    }, [])

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
            name: 'uic',
            label: <Typography variant="subtitle1" fontWeight='bold'><>UIC</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'muic',
            label: <Typography variant="subtitle1" fontWeight='bold'><>MUIC</></Typography>,
            options: {
                filter: true,
            },
        },

        {
            name: 'brand_name',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Brand</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'model_name',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Model</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'tracking_id',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Tracking ID</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'tray_id',
            label: <Typography variant="subtitle1" fontWeight='bold'><>BOT Tray</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'bot_agent',
            label: <Typography variant="subtitle1" fontWeight='bold'><>BOT Agent</></Typography>,
            options: {
                filter: true,
            },
        },
    ]

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Assigned Tray', path: '/' },
                        { name: 'Tray-Item' },
                    ]}
                />
            </div>

            <MUIDataTable
                title={'Tray'}
                data={trayItem}
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
        </Container>
    )
}

export default SimpleMuiTable
