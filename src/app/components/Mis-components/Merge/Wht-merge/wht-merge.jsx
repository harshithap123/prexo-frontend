import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect } from 'react'
import { styled } from '@mui/system'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    IconButton,
    FormControl,
    InputLabel,
    Typography,
    Select,
    MenuItem,
    Table,
    TableContainer,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { axiosWarehouseIn, axiosMisUser } from '../../../../../axios'
import jwt_decode from 'jwt-decode'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'
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
    width: '140%',
    height: '100%',
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

const ScrollableTableContainer = styled(TableContainer)`
    overflow-x: auto;
`

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}))

const BootstrapDialogTitle = (props) => {
    const { children, onClose, ...other } = props
    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    )
}
BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
}

const SimpleMuiTable = () => {
    const [isAlive, setIsAlive] = useState(true)
    const [whtTray, setWhtTray] = useState([])
    const [submitDis, setSubmitDis] = useState(false)
    const [sortingAgent, setSortingAgent] = useState([])
    const [toWhtTray, setToWhatTray] = useState([])
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [mergreData, setMergeData] = useState({
        fromTray: '',
        toTray: '',
        sort_agent: '',
    })
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    setIsLoading(true)
                    let { location } = jwt_decode(admin)
                    let response = await axiosWarehouseIn.post(
                        '/wht-tray/' + 'wht-merge/' + location
                    )
                    if (response.status === 200) {
                        setIsLoading(false)
                        setWhtTray(response.data.data)
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
    }, [isAlive])

    useEffect(() => {
        try {
            let token = localStorage.getItem('prexo-authentication')
            if (token) {
                const { location } = jwt_decode(token)
                const fetchData = async () => {
                    let res = await axiosMisUser.post(
                        '/getSortingAgentMergeMmt/' + location
                    )
                    if (res.status === 200) {
                        setSortingAgent(res.data.data)
                    } else {
                        Swal.fire({
                            position: 'top-center',
                            icon: 'error',
                            title: res?.data?.message,
                            confirmButtonText: 'Ok',
                        })
                    }
                }
                fetchData()
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                confirmButtonText: 'Ok',
                text: error,
            })
        }
    }, [isAlive])

    /* OPEN DIALOG BOX */
    const handelMerge = async (
        e,
        model,
        brand,
        trayId,
        itemCount,
        status,
        type
    ) => {
        e.preventDefault()
        try {
            let token = localStorage.getItem('prexo-authentication')
            if (token) {
                const { location } = jwt_decode(token)
                let obj = {
                    location: location,
                    model: model,
                    brand: brand,
                    fromTray: trayId,
                    itemCount: itemCount,
                    status: status,
                    type: type,
                    sortId: 'Audit Done Closed By Warehouse',
                }

                let res = await axiosMisUser.post('/toWhtTrayForMerge', obj)
                if (res.status === 200) {
                    setOpen(true)
                    setToWhatTray(res.data.data)
                } else {
                    Swal.fire({
                        position: 'top-center',
                        icon: 'error',
                        title: res?.data?.message,
                        confirmButtonText: 'Ok',
                    })
                }
                setMergeData((p) => ({ ...p, fromTray: trayId }))
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
    const handleClose = () => {
        setOpen(false)
        setSubmitDis(false)
        setMergeData((p) => ({
            fromTray: '',
            toTray: '',
            sort_agent: '',
        }))
    }
    /******************************************************************************* */
    const handelViewTray = (e, id) => {
        e.preventDefault()
        navigate('/wareshouse/wht/tray/item/' + id)
    }
    /* REQUEST SEND TO WAREHOUSE */
    const handelSendRequest = async (e) => {
        e.preventDefault()
        try {
            setSubmitDis(true)
            let res = await axiosMisUser.post(
                '/TrayMergeRequestSend',
                mergreData
            )
            if (res.status === 200) {
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: res?.data?.message,
                    confirmButtonText: 'Ok',
                })
                handleClose()
                setIsAlive((isAlive) => !isAlive)
            }
        } catch (error) {
            setSubmitDis(false)
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                confirmButtonText: 'Ok',
                text: error,
            })
        }
    }

    const columns = [
        {
            name: 'index',
            label: (
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ marginLeft: '7px' }}
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
            name: 'code', // field name in the row object
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Tray ID</>
                </Typography>
            ), // column title that will be shown in table
            options: {
                filter: true,
            },
        },

        {
            name: 'warehouse',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Warehouse</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'name',
            label: (
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    <>Tray Display Name</>
                </Typography>
            ),
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
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Quantity</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, tableMeta) =>
                    value?.length + '/' + tableMeta?.rowData[4],
            },
        },
        {
            name: 'type_taxanomy',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Tray Type</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'display',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Tray Display</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'brand',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Brand</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'model',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Model</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'sort_id',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Status</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'created_at',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Creation Date</>
                </Typography>
            ),
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
            label: (
                <Typography variant="subtitle1" fontWeight="bold" sx={{ml:4}}>
                    <>Actions</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <Box sx={{ ml:4 }}>
                            <Button
                                sx={{
                                    width: '74px',
                                    mb: 2,
                                    display: 'block',
                                }}
                                variant="contained"
                                onClick={(e) => {
                                    handelViewTray(e, value)
                                }}
                                style={{ backgroundColor: 'primary' }}
                            >
                                View
                            </Button>
                            <Button
                                sx={{
                                    display: 'block',
                                }}
                                variant="contained"
                                onClick={(e) => {
                                    handelMerge(
                                        e,
                                        tableMeta.rowData[9],
                                        tableMeta.rowData[8],
                                        value,
                                        tableMeta.rowData[5]?.length,
                                        tableMeta.rowData[10],
                                        tableMeta.rowData[6]
                                    )
                                }}
                                style={{ backgroundColor: 'green' }}
                            >
                                Merge
                            </Button>
                        </Box>
                    )
                },
            },
        },
    ]

    return (
        <Container>
            <BootstrapDialog
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth
                maxWidth="xs"
            >
                <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={handleClose}
                >
                    Tray Merge
                </BootstrapDialogTitle>

                <DialogContent dividers>
                    <FormControl fullWidth>
                        <InputLabel
                            sx={{ pt: 2 }}
                            id="demo-simple-select-label"
                        >
                            To WHT Tray
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            label="Cpc"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            {toWhtTray.map((data) => (
                                <MenuItem
                                    onClick={(e) => {
                                        setMergeData((p) => ({
                                            ...p,
                                            toTray: data.code,
                                        }))
                                    }}
                                    value={data.code}
                                >
                                    {data.code} - ({data.items.length})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel
                            sx={{ pt: 2 }}
                            id="demo-simple-select-label"
                        >
                            Sorting Agent
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            label="Cpc"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            {sortingAgent.map((data) => (
                                <MenuItem
                                    onClick={(e) => {
                                        setMergeData((p) => ({
                                            ...p,
                                            sort_agent: data.user_name,
                                        }))
                                    }}
                                    value={data.user_name}
                                >
                                    {data.user_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={
                            submitDis ||
                            mergreData.sort_agent === '' ||
                            mergreData.toTray === ''
                        }
                        style={{ backgroundColor: 'green' }}
                        onClick={(e) => {
                            handelSendRequest(e)
                        }}
                    >
                        SUBMIT
                    </Button>
                </DialogActions>
            </BootstrapDialog>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Merge', path: '/' },
                        { name: 'Wht' },
                    ]}
                />
            </div>

            <ScrollableTableContainer>
                <ProductTable>
                    <MUIDataTable
                        title={'Wht Tray'}
                        data={whtTray}
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
                                                : 1) *
                                            (order === 'desc' ? 1 : -1)
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
                </ProductTable>
            </ScrollableTableContainer>
        </Container>
    )
}

export default SimpleMuiTable
