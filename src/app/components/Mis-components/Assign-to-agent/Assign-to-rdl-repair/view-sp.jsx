import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { useParams } from 'react-router-dom'
import jwt_decode from 'jwt-decode'
import { axiosWarehouseIn } from '../../../../../axios'
import { axiosMisUser } from '../../../../../axios'
import {
    Card,
    Dialog,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material'
// import AssignDialogBox from './recievedialog'
import PropTypes from 'prop-types'
import CloseIcon from '@mui/icons-material/Close'
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
    const [tray, setTray] = useState({})
    const { trayId } = useParams()

    useEffect(() => {
        const fetchWht = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    let { location } = jwt_decode(admin)
                    const res = await axiosWarehouseIn.post(
                        '/getWhtTrayItem/' +
                            trayId +
                            '/' +
                            'all-wht-tray/' +
                            location
                    )
                    if (res.status === 200) {
                        setTray(res.data?.data)
                    }
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                })
            }
        }
        fetchWht()
    }, [])

    const columns = [
        {
            name: 'index',
            label: (
                <Typography sx={{ fontWeight: 'bold', ml: 2 }}>
                    Record No
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                // setCellProps: () => ({ align: 'center' }),
                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography sx={{ pl: 4 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },
        {
            name: 'partId',
            label: (
                <Typography sx={{ fontWeight: 'bold' }}>Part Number</Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'partName',
            label: (
                <Typography sx={{ fontWeight: 'bold' }}>
                    Spare Part Name
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'selected_qty',
            label: (
                <Typography sx={{ fontWeight: 'bold' }}>Quantity</Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'status',
            label: <Typography sx={{ fontWeight: 'bold' }}>Status</Typography>,
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
                        { name: 'Assign To Agent', path: '/' },
                        { name: 'RDL-two', path: '/' },
                        { name: 'View sp tray' },
                    ]}
                />
            </div>
            <Card>
                <MUIDataTable
                    title={'Tray'}
                    data={tray?.items}
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
                                    (a.data[colIndex] < b.data[colIndex]
                                        ? -1
                                        : 1) * (order === 'desc' ? 1 : -1)
                                )
                            })
                        },
                        elevation: 0,
                        rowsPerPageOptions: [10, 20, 40, 80, 100],
                    }}
                />
            </Card>
        </Container>
    )
}

export default SimpleMuiTable
