import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { Button, Typography, Box, TextField } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { axiosMisUser } from '../../../../../axios'
import jwt_decode from 'jwt-decode'
import Swal from 'sweetalert2'

const TextFieldCustOm = styled(TextField)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

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
    const [item, setItem] = useState([])
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const handelViewItem = (brand, model, jack) => {
        navigate(
            '/mis/assign-to-agent/chargingplanner/view-wht-tray/' +
                brand +
                '/' +
                model +
                '/' +
                jack
        )
    }

    useEffect(() => {
        let admin = localStorage.getItem('prexo-authentication')
        if (admin) {
            setIsLoading(true)
            const { location } = jwt_decode(admin)
            const fetchData = async () => {
                try {
                    let obj={
                        location:location,
                        type:"Closed",
                        type1:"Recharging"
                    }
                    let res = await axiosMisUser.post(
                        '/plannerPage/charging',obj 
                    )
                    if (res.status === 200) {
                        console.log(res.data.data);
                        setIsLoading(false)
                        setItem(res.data.data)
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
        } else {
            navigate('/')
        }
        return () => {
            setIsAlive(false)
            setIsLoading(false)
        }
    }, [isAlive])

    const columns = [
        {
            name: 'index',
            label: (
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    marginLeft="7px"
                >
                    <>Record No</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography sx={{ pl: 4 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },
        {
            name: '_id',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Brand</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.brand || '',
                // customBodyRender: (value, dataIndex) => value?.muic || '',
            },
        },
        {
            name: '_id',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Model</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.model || '',
                // customBodyRender: (value, dataIndex) => value?.muic || '',
            },
        },
        {
            name: '_id',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Jack Type</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.charging_jack_type?.[0] || '',
            },
        },
        {
            name: 'count',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>WHT Tray</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'code',
            label: (
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    marginLeft="8px"
                >
                    <>Action</>
                </Typography>
            ),
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
                            onClick={(e) => {
                                handelViewItem(
                                    tableMeta.rowData[1]?.brand,
                                    tableMeta.rowData[2]?.model,
                                    tableMeta.rowData[3]
                                        ?.charging_jack_type?.[0]
                                )
                            }}
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
                    routeSegments={[
                        { name: 'Assign-to-agent', path: '/' },
                        { name: 'Charging Planner' },
                    ]}
                />
            </div>

            {/* <Box sx={{ display: 'flex' }}>
                <Typography>Filter :</Typography>
                <TextFieldCustOm
                    sx={{ ml: 1 }}
                    label="Brand"
                    select
                    type="text"
                    style={{ width: '150px' }}
                />
                <TextFieldCustOm
                    sx={{ ml: 2 }}
                    label="Model"
                    select
                    type="text"
                    style={{ width: '150px' }}
                />
                <Box>
                    <Button
                        sx={{
                            m: 1,
                        }}
                        variant="contained"
                        // onClick={() => handelViewItem(tableMeta.rowData[2]?.brand,tableMeta.rowData[3]?.model)}
                        style={{ backgroundColor: 'green' }}
                        component="span"
                    >
                        Submit
                    </Button>
                </Box>
            </Box> */}

            <MUIDataTable
                title={'Planner for Charging'}
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
