import React, { useEffect, useState, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import {
    Box,
    Button,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    IconButton,
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
// import jwt from "jsonwebtoken"
import jwt_decode from 'jwt-decode'
import Swal from 'sweetalert2'
import CloseIcon from '@mui/icons-material/Close'
import { axiosBqc } from '../../../../axios'

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

export default function DialogBox() {
    const navigate = useNavigate()
    const [trayData, setTrayData] = useState([])
    const { trayId } = useParams()
    const [textBoxDis, setTextBoxDis] = useState(false)
    /**************************************************************************** */
    const [uic, setUic] = useState('')
    const [description, setDescription] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [open, setOpen] = useState(false)
    const [resDataUic, setResDataUic] = useState({})
    const [loading, setLoading] = useState(false)
    const [deviceButDis, setDeviceButDis] = useState(false)

    const handleClose = () => {
        setTextBoxDis(false)
        setOpen(false)
    }

    const handleClickOpen = () => {
        setOpen(true)
    }
    /*********************************************************** */

    useEffect(() => {
        const fetchData = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    let { user_name } = jwt_decode(admin)
                    let response = await axiosBqc.post(
                        '/assigned-wht-item/' +
                            trayId +
                            '/' +
                            user_name +
                            '/' +
                            'Issued to BQC' +
                            '/' +
                            'Page-1'
                    )
                    if (response.status === 200) {
                        setTrayData(response.data.data)
                    } else if (response.status === 202) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: response.data.message,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                navigate(-1)
                            }
                        })
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
    }, [refresh])

    const handelUic = async (e) => {
        if (e.target.value.length === 11) {
            try {
                let obj = {
                    uic: e.target.value,
                    trayId: trayId,
                }
                setTextBoxDis(true)
                let res = await axiosBqc.post(
                    '/bqc-uic-checking-first-time',
                    obj
                )
                if (res?.status == 200) {
                    setResDataUic(res.data.data)
                    navigate(
                        '/bqc/tray/item-verify/prompt',
                        {
                            state: {
                                resDataUic: res.data.data,
                                trayData: trayData,
                                trayId:trayId
                            },
                        }
                    )
                } else if (res.status === 202) {
                    setUic('')
                    setTextBoxDis(false)
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: res.data.message,
                    })
                }
            } catch (error) {
                setTextBoxDis(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                })
            }
        }
    }

    /************************************************************************** */
    const addActualitem = async (e, type, value) => {
        if (e.keyCode !== 32) {
            if (
                trayData.limit <=
                trayData?.temp_array?.length + trayData?.actual_items?.length
            ) {
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: 'All Items Scaanned',
                    confirmButtonText: 'Ok',
                })
            } else {
                handleClose()
                try {
                    resDataUic.bqc_status = value
                    let objData = {
                        condiation: type,
                        trayId: trayId,
                        item: resDataUic,
                    }
                    setDeviceButDis(true)
                    setTextBoxDis(true)
                    let res = await axiosBqc.post('/add-wht-item', objData)
                    if (res.status == 200) {
                        setUic('')
                        setDeviceButDis(false)
                        setTextBoxDis(false)
                        setRefresh((refresh) => !refresh)
                        handleClose()
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: res.data.message,
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
        }
    }

    /************************************************************************** */
    const handelIssue = async (e) => {
        e.preventDefault()
        navigate('/bqc/tray/bqc-out/' + trayId)
    }

    const tableExpected = useMemo(() => {
        return (
            <Paper sx={{ width: '95%', overflow: 'hidden', m: 1 }}>
                <Box sx={{}}>
                    <Box
                        sx={{
                            float: 'left',
                            ml: 2,
                        }}
                    >
                        <h5>DEVICE IN PROGRESS FOR BQC</h5>
                    </Box>
                    <Box
                        sx={{
                            float: 'right',
                            mr: 2,
                        }}
                    >
                        <Box sx={{}}>
                            <h5>Total</h5>
                            <p style={{ paddingLeft: '5px', fontSize: '22px' }}>
                                {trayData?.actual_items?.length}/
                                {trayData?.limit}
                            </p>
                        </Box>
                    </Box>
                </Box>
                <TableContainer>
                    <Table
                        style={{ width: '100%' }}
                        id="example"
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{pl:2}}>S.NO</TableCell>
                                <TableCell>UIC</TableCell>
                                <TableCell>MUIC</TableCell>
                                <TableCell>BOT Tray</TableCell>
                                <TableCell>BOT Agent</TableCell>
                                {/* <TableCell>Tracking Number</TableCell> */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trayData?.actual_items?.map((data, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1}>
                                    <TableCell sx={{pl:3}}>{index + 1}</TableCell>
                                    <TableCell>{data?.uic}</TableCell>
                                    <TableCell>{data?.muic}</TableCell>
                                    <TableCell>{data?.tray_id}</TableCell>
                                    <TableCell>{data?.bot_agent}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        )
    }, [trayData?.actual_items])

    const tableActual = useMemo(() => {
        return (
            <Paper sx={{ width: '98%', overflow: 'hidden', m: 1 }}>
                <Box sx={{}}>
                    <Box
                        sx={{
                            float: 'left',
                            ml: 2,
                        }}
                    >
                        <h5>DEVICE NOT TO BE CHECKED FOR BQC</h5>
                    </Box>
                    <Box
                        sx={{
                            float: 'right',
                            mr: 2,
                        }}
                    >
                        <Box sx={{}}>
                            <h5>Total</h5>
                            <p style={{ marginLeft: '5px', fontSize: '24px' }}>
                                {trayData.temp_array?.length}/{trayData?.limit}
                            </p>
                        </Box>
                    </Box>
                </Box>
                <TableContainer>
                    <Table
                        style={{ width: '100%' }}
                        id="example"
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{pl:2}}>S.NO</TableCell>
                                <TableCell>UIC</TableCell>
                                <TableCell>MUIC</TableCell>
                                <TableCell>BOT Tray</TableCell>
                                <TableCell>BOT Agent</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {trayData?.temp_array?.map((data, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1}>
                                    <TableCell sx={{pl:3}}>{index + 1}</TableCell>
                                    <TableCell>{data?.uic}</TableCell>
                                    <TableCell>{data?.muic}</TableCell>
                                    <TableCell>{data?.tray_id}</TableCell>
                                    <TableCell>{data?.bot_agent}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        )
    }, [trayData?.temp_array, textBoxDis])
    

    return (
        <>
            <BootstrapDialog
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth
                maxWidth="xs"
            >
                <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={handleClose}
                ></BootstrapDialogTitle>
                <DialogContent dividers>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexDirection: 'column',
                            p: 1,
                            m: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                        }}
                    >
                        <TextField
                            label="UIC"
                            variant="outlined"
                            type="text"
                            value={resDataUic?.uic}
                            disabled={
                                resDataUic?.uic == '' ||
                                resDataUic?.uic == undefined
                            }
                            sx={{ mt: 2 }}
                            fullWidth
                        />

                        <TextField
                            label="Model Name"
                            variant="outlined"
                            type="text"
                            value={resDataUic?.model_name}
                            disabled={
                                resDataUic?.model_name == '' ||
                                resDataUic?.model_name == undefined
                            }
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        <TextField
                            label="Battery Status"
                            variant="outlined"
                            type="text"
                            value={resDataUic?.charging?.battery_status}
                            disabled={
                                resDataUic?.charging?.battery_status == '' ||
                                resDataUic?.charging?.battery_status ==
                                    undefined
                            }
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        <TextField
                            label="Charge Percentage"
                            variant="outlined"
                            type="text"
                            value={resDataUic?.charging?.charge_percentage}
                            disabled={
                                resDataUic?.charging?.charge_percentage == '' ||
                                resDataUic?.charging?.charge_percentage ==
                                    undefined
                            }
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        <TextField
                            label="Body Condition"
                            variant="outlined"
                            type="text"
                            value={resDataUic?.charging?.body_condition}
                            disabled={
                                resDataUic?.charging?.body_condition == '' ||
                                resDataUic?.charging?.body_condition ==
                                    undefined
                            }
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        <TextField
                            label="Display Condition"
                            variant="outlined"
                            type="text"
                            value={resDataUic?.charging?.display_condition}
                            disabled={
                                resDataUic?.charging?.display_condition == '' ||
                                resDataUic?.charging?.display_condition ==
                                    undefined
                            }
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        <TextField
                            label="Lock Status"
                            variant="outlined"
                            type="text"
                            value={resDataUic?.charging?.lock_status}
                            disabled={
                                resDataUic?.charging?.lock_status == '' ||
                                resDataUic?.charging?.lock_status == undefined
                            }
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        <TextField
                            label="Charging Jack Type"
                            variant="outlined"
                            type="text"
                            sx={{ mt: 2 }}
                            disabled={
                                resDataUic?.charging?.charging_jack_type ==
                                    '' ||
                                resDataUic?.charging?.charging_jack_type ==
                                    undefined
                            }
                            value={resDataUic?.charging?.charging_jack_type}
                            fullWidth
                        />
                        <TextField
                            label="Any Body Part Missing"
                            variant="outlined"
                            type="text"
                            disabled={
                                resDataUic?.charging?.boady_part_missing ==
                                    '' ||
                                resDataUic?.charging?.boady_part_missing ==
                                    undefined
                            }
                            value={resDataUic?.charging?.boady_part_missing}
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        {resDataUic?.charging?.boady_part_missing == 'YES' ? (
                            <TextField
                                label="Missing Body Part Name"
                                variant="outlined"
                                type="text"
                                disabled={
                                    resDataUic?.charging?.part_name == '' ||
                                    resDataUic?.charging?.part_name == undefined
                                }
                                value={resDataUic?.charging?.part_name}
                                sx={{ mt: 2 }}
                                fullWidth
                            />
                        ) : null}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            ml: 2,
                        }}
                        fullwidth
                        variant="contained"
                        disabled={deviceButDis}
                        style={{ backgroundColor: 'red' }}
                        component="span"
                        type="submit"
                        onClick={(e) => {
                            addActualitem(
                                e,
                                'Device Out',
                                'Device not to be checked for BQC'
                            )
                        }}
                    >
                        Device not to be checked for BQC
                    </Button>
                    <Button
                        sx={{
                            ml: 2,
                        }}
                        fullwidth
                        variant="contained"
                        style={{ backgroundColor: 'green' }}
                        component="span"
                        type="submit"
                        disabled={deviceButDis}
                        onClick={(e) => {
                            addActualitem(
                                e,
                                'Device In',
                                'Device in progress for BQC'
                            )
                        }}
                    >
                        Device in progress for BQC
                    </Button>
                </DialogActions>
            </BootstrapDialog>
            <Box
                sx={{
                    mt: 1,
                    height: 70,
                    borderRadius: 1,
                    mb: 8,
                }}
            >
                <Box
                    sx={{
                        float: 'left',
                    }}
                >
                    <h4 style={{ marginLeft: '8px' }}>TRAY ID - {trayId}</h4>
                    <h4 style={{ marginLeft: '8px' }}>
                        AGENT NAME - {trayData?.issued_user_name}
                    </h4>
                    <TextField
                        sx={{ mt: 1, ml: 1 }}
                        id="outlined-password-input"
                        type="text"
                        disabled={textBoxDis}
                        inputRef={(input) => input && input.focus()}
                        name="doorsteps_diagnostics"
                        label="SCAN UIC"
                        value={uic}
                        onChange={(e) => {
                            setUic(e.target.value)
                            handelUic(e)
                        }}
                        inputProps={{
                            style: {
                                width: 'auto',
                            },
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        float: 'right',
                    }}
                >
                    <h4 style={{ marginRight: '13px' }}>
                        Brand -- {trayData?.brand}
                    </h4>
                    <h4 style={{ marginRight: '13px' }}>
                        Model -- {trayData?.model}
                    </h4>
                </Box>
            </Box>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    {tableExpected}
                </Grid>
                <Grid item xs={6}>
                    {tableActual}
                </Grid>
            </Grid>
            <div style={{ float: 'right' }}>
                <Box sx={{ float: 'right' }}>
                    <Button
                        sx={{ m: 3, mb: 9 }}
                        variant="contained"
                        disabled={
                            (trayData?.sort_id == 'BQC work inprogress') == true
                                ? false
                                : false || trayData?.items?.length !== 0
                        }
                        style={{ backgroundColor: 'green' }}
                        onClick={(e) => {
                            handelIssue(e)
                        }}
                    >
                        START BQC
                    </Button>
                </Box>
            </div>
        </>
    )
}
