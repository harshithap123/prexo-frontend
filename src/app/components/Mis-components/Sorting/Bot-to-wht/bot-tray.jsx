import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import { Button, Box, TextField, Checkbox, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { axiosMisUser } from '../../../../../axios'
import moment from 'moment'
import jwt_decode from 'jwt-decode'
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
    const [item, setItem] = useState([])
    const navigate = useNavigate()
    const [sortDate, setSortDate] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sortData, setSortData] = useState(false)
    const [yesterdayDate, setYesterDayDate] = useState('')
    const [isCheck, setIsCheck] = useState([])

    useEffect(() => {
        let date = new Date() // Today!
        setYesterDayDate(date.setDate(date.getDate() - 1))
        let admin = localStorage.getItem('prexo-authentication')
        if (admin) {
            setIsLoading(true)
            const { location } = jwt_decode(admin)
            const fetchData = async () => {
                try {
                    let res = await axiosMisUser.post(
                        '/wh-closed-bot-tray/' + location
                    )
                    if (res.status === 200) {
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

    const handelSort = async (e) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            let admin = localStorage.getItem('prexo-authentication')
            if (admin) {
                const { location } = jwt_decode(admin)
                let obj = {
                    date: sortDate,
                    location: location,
                }
                let res = await axiosMisUser.post('/wht-bot-sort', obj)
                if (res.status === 200) {
                    setIsLoading(false)
                    setSortData(true)
                    setItem(res.data.data)
                }
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
    const handleClick = (e) => {
        const { id, checked } = e.target
        setIsCheck([...isCheck, id])
        if (!checked) {
            setIsCheck(isCheck.filter((item) => item !== id))
        }
    }
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } }
    /*-----------------------------------------------------------------------------*/
    // NAVIGATE TO ASSIGN FOR SORTING PAGE
    const handelAssignForSorting = (e, code) => {
        e.preventDefault()
        navigate('/mis/sorting/bot-to-wht/assign-for-sorting', {
            state: { isCheck: isCheck, type: 'Not From Request' },
        })
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
            name: 'code',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Tray ID</></Typography>,
            options: {
                filter: true,
            },
        },
        {
            name: 'closed_time_wharehouse_from_bot',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Date of Closure</></Typography>,
            options: {
                filter: true,
                customBodyRender: (value) =>
                    new Date(value).toLocaleString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    }),
            },
        },
        {
            name: 'limit',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Limit</></Typography>,
            options: {
                filter: false,
                sort: false,
                display: false,
            },
        },
        {
            name: 'items',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Items Count</></Typography>,
            options: {
                filter: true,
                customBodyRender: (value, tableMeta) =>
                    value.length + '/' + tableMeta.rowData[4],
            },
        },
        {
            name: 'temp_array',
            label: <Typography variant="subtitle1" fontWeight='bold'><>SKU Count</></Typography>,
            options: {
                filter: true,
                customBodyRender: (value, tableMeta) => value.length,
            },
        },
        {
            name: 'sort_id',
            label: <Typography variant="subtitle1" fontWeight='bold'><>Status</></Typography>,
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
                    <h3>
                        Date:-{' '}
                        {new Date(
                            sortDate != '' && sortData === true
                                ? sortDate
                                : yesterdayDate
                        ).toLocaleString('en-GB', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        })}
                    </h3>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'start',
                        justifyContent: 'flex-end',
                    }}
                >
                    <TextField
                        id="filled-select-currency"
                        type="Date"
                        onChange={(e) => {
                            setSortDate(e.target.value)
                        }}
                        inputProps={{
                            max: moment().format('YYYY-MM-DD'),
                        }}
                        sx={{ mt: 1, mb: 1 }}
                        helperText="Please Select BOT closed Date"
                        variant="filled"
                    />
                    <Button
                        sx={{
                            mt: 20,
                            m: 2,
                            height: '38px',
                        }}
                        disabled={sortDate == '' ? true : false}
                        variant="contained"
                        style={{
                            backgroundColor: '#206CE2',
                            marginTop: '23px',
                        }}
                        onClick={(e) => {
                            handelSort(e)
                        }}
                    >
                        Sort
                    </Button>
                    <Box>
                        <Button
                            sx={{
                                mt: 2,
                                height: '48px',
                                width: '200px',
                            }}
                            variant="contained"
                            style={{ backgroundColor: 'green' }}
                            component="span"
                            disabled={isCheck.length === 0}
                            onClick={(e) => {
                                handelAssignForSorting(e)
                            }}
                        >
                            Assign For Sorting
                        </Button>
                    </Box>
                </Box>
            </Box>

            <MUIDataTable
                title={'Wht Tray'}
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
