import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Typography, Table, TableContainer } from '@mui/material'
import { axiosWarehouseIn } from '../../../../../axios'

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

const ScrollableTableContainer = styled(TableContainer)
`overflow-x: auto`;

const SimpleMuiTable = () => {
    const [trayData, setTrayData] = useState([])
    const { trayId } = useParams()

    useEffect(() => {
        const fetchData = async () => {
            try {
                let res = await axiosWarehouseIn.post('/trayItem/' + trayId)
                if (res.status === 200) {
                    setTrayData(res.data.data)
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
    }, [])

    const columns = [
        {
            name: 'index',
            label: <Typography sx={{fontWeight:'bold', ml:2}}>Record No</Typography>,
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) =>
                <Typography sx={{pl:4}}>{dataIndex.rowIndex + 1}</Typography>
            },
        },
        {
            name: 'imei',
            label: <Typography sx={{fontWeight:'bold'}}>IMEI</Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'uic',
            label: <Typography sx={{fontWeight:'bold'}}>UIC</Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'sort_id',
            label: <Typography sx={{fontWeight:'bold'}}>Brand</Typography>,
            options: {
                filter: true,
                customBodyRender: (value) => {
                    return trayData.brand
                },
            },
        },
        {
            name: 'sort_id',
            label: <Typography sx={{fontWeight:'bold'}}>Model</Typography>,
            options: {
                filter: true,
                customBodyRender: (value) => {
                    return trayData.model
                },
            },
        },

        {
            name: 'rdl_fls_report',
            label: <Typography sx={{fontWeight:'bold'}}>RDL Status</Typography>,
            options: {
                filter: true,
                customBodyRender: (value) => {
                    return value?.selected_status
                },
            },
        },
        {
            name: 'rdl_fls_report',
            label: <Typography sx={{fontWeight:'bold'}}>Model Required</Typography>,
            options: {
                filter: true,
                customBodyRender: (value) => {
                    return value?.model_reg
                },
            },
        },
        // {
        //     name: 'rdl_fls_report',
        //     label: 'Part List Count',
        //     options: {
        //         filter: true,
        //         customBodyRender: (value) => {
        //             return value?.part_list_count
        //         },
        //     },
        // },
        // {
        //     name: 'rdl_fls_report',
        //     label: 'Part List 1',
        //     options: {
        //         filter: true,
        //         customBodyRender: (value) => {
        //             return value?.part_list_1
        //         },
        //     },
        // },
        // {
        //     name: 'rdl_fls_report',
        //     label: 'Part List 2',
        //     options: {
        //         filter: true,
        //         customBodyRender: (value) => {
        //             return value?.part_list_2
        //         },
        //     },
        // },
        // {
        //     name: 'rdl_fls_report',
        //     label: 'Part List 3',
        //     options: {
        //         filter: true,
        //         customBodyRender: (value) => {
        //             return value?.part_list_3
        //         },
        //     },
        // },
        // {
        //     name: 'rdl_fls_report',
        //     label: 'Part List 4',
        //     options: {
        //         filter: true,
        //         customBodyRender: (value) => {
        //             return value?.part_list_4
        //         },
        //     },
        // },
        {
            name: 'rdl_fls_report',
            label: 'RDL 1 Added Part List',
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                {
                    return value?.partRequired?.map((data, index) => (
                        <p>
                            
                            {index + 1}.{data?.part_name} - {data?.part_id} ,
                        </p>
                    ))
                }
            },
        },
        {
            name: 'rdl_fls_report',
            label: <Typography sx={{fontWeight:'bold'}}>Color</Typography>,
            options: {
                filter: true,
                customBodyRender: (value) => {
                    return value?.color
                },
            },
        },
        {
            name: 'rdl_fls_report',
            label: <Typography sx={{fontWeight:'bold'}}>Description</Typography>,
            options: {
                filter: true,
                customBodyRender: (value) => {
                    return value?.description
                },
            },
        },
    ]

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'WHT', path: '/' },
                        { name: 'Items' },
                    ]}
                />
            </div>

            <ScrollableTableContainer>
                <ProductTable>
                <MUIDataTable
                title={'Tray'}
                data={trayData.items}
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
                </ProductTable>
            </ScrollableTableContainer>
            
        </Container>
    )
}

export default SimpleMuiTable
