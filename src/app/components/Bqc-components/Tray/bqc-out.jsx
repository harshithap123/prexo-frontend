import React, { useEffect, useState, useMemo } from 'react'
import { styled } from '@mui/material/styles'

import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    IconButton,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
// import jwt from "jsonwebtoken"
import jwt_decode from 'jwt-decode'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import CloseIcon from '@mui/icons-material/Close'

import { axiosBqc, axiosWarehouseIn } from '../../../../axios'
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
    /**************************************************************************** */
    const [uic, setUic] = useState('')
    const [description, setDescription] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [open, setOpen] = useState(false)
    const [resDataUic, setResDataUic] = useState({})
    const [bqcStatus, setBqcStatus] = useState('')
    const [incompleteRes, setIncompleteRes] = useState('')
    const [loading, setLoading] = useState(false)
    const [textBoxDis, setTextBoxDis] = useState(false)
    const [addButDis, setAddButDis] = useState(false)
    const [restFact, setResFact] = useState('')
    const handleClose = () => {
        setOpen(false)
    }
    /************************************************************************** */
    const schema = Yup.object().shape({
        blancoo_qc_status: Yup.string().required('Required*').nullable(),
        bqc_incomplete_reason: Yup.string()
            .when('blancoo_qc_status', (blancoo_qc_status, schema) => {
                if (blancoo_qc_status == 'BQC Incomplete') {
                    return schema.required('Required')
                }
            })
            .nullable(),
        technical_issue: Yup.string()
            .when('bqc_incomplete_reason', (bqc_incomplete_reason, schema) => {
                if (bqc_incomplete_reason == 'Blancco Technical Issue') {
                    return schema.required('Required')
                }
            })
            .nullable(),
        other: Yup.string()
            .when('bqc_incomplete_reason', (bqc_incomplete_reason, schema) => {
                if (bqc_incomplete_reason == 'Other') {
                    return schema.required('Required')
                }
            })
            .nullable(),
        factory_reset_status: Yup.string()
            .when('blancoo_qc_status', (blancoo_qc_status, schema) => {
                if (blancoo_qc_status == 'BQC Finished') {
                    return schema.required('Required')
                }
            })
            .nullable(),
    })
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
    })
    /*********************************************************** */
    let admin = localStorage.getItem('prexo-authentication')
    let user_name1
    if (admin) {
        let { user_name } = jwt_decode(admin)
        user_name1 = user_name
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                let response = await axiosBqc.post(
                    '/assigned-wht-item/' +
                        trayId +
                        '/' +
                        user_name1 +
                        '/' +
                        'Issued to BQC' +
                        '/' +
                        'Page-1'
                )
                if (response.status === 200) {
                    setTrayData(response.data.data)
                    //   dataTableFun()
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
                let res = await axiosBqc.post('/bqc-done-uic-check', obj)
                if (res?.status == 200) {
                    setResDataUic(res.data.data)
                    handleClickOpen()
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
    const onSubmit = async (value) => {
        if (trayData.actual_items.length <= trayData?.items?.length) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'All Items Scanned',
            })
        } else {
            setAddButDis(true)
            if (value.blancoo_qc_status == 'BQC Finished') {
                value.bqc_incomplete_reason = ''
                value.technical_issue = ''
                value.other = ''
            } else {
                value.factory_reset_status = ''
            }

            try {
                let objData = {
                    trayId: trayId,
                    item: resDataUic,
                    page: 'bqc',
                }
                objData.item.bqc_report = value
                setTextBoxDis(true)
                let res = await axiosWarehouseIn.post(
                    '/wht-add-actual-item',
                    objData
                )
                if (res.status == 200) {
                    setUic('')
                    setTextBoxDis(false)
                    setAddButDis(false)
                    setRefresh((refresh) => !refresh)
                    handleClose()
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                })
            }
        }
    }

    /************************************************************************** */
    const handelIssue = async (e) => {
        try {
            if (trayData?.actual_items?.length == trayData?.items?.length) {
                let obj = {
                    trayId: trayId,
                    description: description,
                }
                setLoading(true)
                let res = await axiosBqc.post('/bqc-done', obj)
                if (res.status == 200) {
                    setLoading(false)
                    Swal.fire({
                        icon: 'success',
                        title: res?.data?.message,
                        showConfirmButton: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/bqc/tray')
                        }
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: res.data.message,
                    })
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Please Verify Actual Data',
                })
            }
        } catch (error) {
            setLoading(false)
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
            })
        }
    }

    const handleClickOpen = () => {
        setBqcStatus('')
        setIncompleteRes('')
        setResFact('')
        reset({})
        setOpen(true)
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
                        <h5>EXPECTED</h5>
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
                                <TableCell sx={{ pl: 2 }}>S.NO</TableCell>
                                <TableCell>UIC</TableCell>
                                <TableCell>MUIC</TableCell>
                                <TableCell>BOT Tray</TableCell>
                                <TableCell>BOT Agent</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {trayData?.actual_items?.map((data, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1}>
                                    <TableCell sx={{ pl: 3 }}>
                                        {index + 1}
                                    </TableCell>
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
                        <h5>ACTUAL</h5>
                        <TextField
                            sx={{ mt: 1 }}
                            id="outlined-password-input"
                            type="text"
                            disabled={textBoxDis}
                            inputRef={(input) => input && input.focus()}
                            name="doorsteps_diagnostics"
                            label="SCAN UIC"
                            value={uic}
                            // onChange={(e) => setAwbn(e.target.value)}
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
                            mr: 2,
                        }}
                    >
                        <Box sx={{}}>
                            <h5>Total</h5>
                            <p style={{ marginLeft: '5px', fontSize: '24px' }}>
                                {trayData.items?.length}/{trayData?.limit}
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
                                <TableCell sx={{ pl: 2 }}>S.NO</TableCell>
                                <TableCell>UIC</TableCell>
                                <TableCell>MUIC</TableCell>
                                <TableCell>BOT Tray</TableCell>
                                <TableCell>BOT Agent</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {trayData?.items?.map((data, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1}>
                                    <TableCell sx={{ pl: 3 }}>
                                        {index + 1}
                                    </TableCell>
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
    }, [trayData?.items, textBoxDis, uic])
    
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
                >
                    ADD
                </BootstrapDialogTitle>
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
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        <TextField
                            label="Model Name"
                            variant="outlined"
                            type="text"
                            value={resDataUic?.model_name}
                            sx={{ mt: 2 }}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel
                                sx={{ pt: 2 }}
                                id="demo-simple-select-label"
                            >
                                Blancco QC Status
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                fullWidth
                                label="Battery Status"
                                value={getValues('blancoo_qc_status')}
                                {...register('blancoo_qc_status')}
                                error={errors.blancoo_qc_status ? true : false}
                                helperText={errors.blancoo_qc_status?.message}
                                sx={{ mt: 2 }}
                            >
                                <MenuItem
                                    value="BQC Finished"
                                    onClick={(e) => {
                                        setBqcStatus('BQC Finished')
                                    }}
                                >
                                    BQC Finished
                                </MenuItem>
                                <MenuItem
                                    value="BQC Incomplete"
                                    onClick={(e) => {
                                        setBqcStatus('BQC Incomplete')
                                        setResFact('NO')
                                    }}
                                >
                                    BQC Incomplete
                                </MenuItem>
                            </Select>
                        </FormControl>
                        {bqcStatus === 'BQC Incomplete' ? (
                            <FormControl fullWidth>
                                <InputLabel
                                    sx={{ pt: 2 }}
                                    id="demo-simple-select-label"
                                >
                                    BQC Incomplete Reason
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    fullWidth
                                    label="BQC incomplete reason"
                                    value={getValues('bqc_incomplete_reason')}
                                    {...register('bqc_incomplete_reason')}
                                    error={
                                        errors.bqc_incomplete_reason
                                            ? true
                                            : false
                                    }
                                    helperText={
                                        errors.bqc_incomplete_reason?.message
                                    }
                                    sx={{ mt: 2 }}
                                >
                                    <MenuItem
                                        value="Jack Issue"
                                        onClick={(e) => {
                                            setIncompleteRes('Jack Issue')
                                        }}
                                    >
                                        Jack Issue
                                    </MenuItem>
                                    <MenuItem
                                        value="Blancco Technical Issue"
                                        onClick={(e) => {
                                            setIncompleteRes(
                                                'Blancco Technical Issue'
                                            )
                                        }}
                                    >
                                        Blancco Technical Issue
                                    </MenuItem>
                                    <MenuItem
                                        value="Other"
                                        onClick={(e) => {
                                            setIncompleteRes('Other')
                                        }}
                                    >
                                        BQC Remark
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        ) : null}
                        {incompleteRes === 'Blancco Technical Issue' &&
                        bqcStatus === 'BQC Incomplete' ? (
                            <>
                                <FormControl fullWidth>
                                    <InputLabel
                                        sx={{ pt: 2 }}
                                        id="demo-simple-select-label"
                                    >
                                        Technical Issue
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        fullWidth
                                        label="Body Condition"
                                        value={getValues('technical_issue')}
                                        {...register('technical_issue')}
                                        error={
                                            errors.technical_issue
                                                ? true
                                                : false
                                        }
                                        helperText={
                                            errors.technical_issue?.message
                                        }
                                        sx={{ mt: 2 }}
                                    >
                                        <MenuItem value="App installation issue">
                                            App installation issue
                                        </MenuItem>
                                        <MenuItem value="App hanging issue">
                                            App hanging issue
                                        </MenuItem>
                                        <MenuItem value="Test result not correct in blancco app">
                                            Test result not correct in blancco
                                            app
                                        </MenuItem>
                                        <MenuItem value="Taking too much time in processing">
                                            Taking too much time in processing
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </>
                        ) : null}
                        {incompleteRes === 'Other' &&
                        bqcStatus === 'BQC Incomplete' ? (
                            <TextField
                                label="BQC Remark"
                                variant="outlined"
                                type="text"
                                {...register('other')}
                                error={errors.other ? true : false}
                                helperText={errors.other?.message}
                                sx={{ mt: 2 }}
                                fullWidth
                            />
                        ) : null}
                        {bqcStatus === 'BQC Finished' ? (
                            <FormControl fullWidth>
                                <InputLabel
                                    sx={{ pt: 2 }}
                                    id="demo-simple-select-label"
                                >
                                    Factory reset status
                                </InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    fullWidth
                                    label="Factory reset status"
                                    value={getValues('factory_reset_status')}
                                    {...register('factory_reset_status')}
                                    error={
                                        errors.factory_reset_status
                                            ? true
                                            : false
                                    }
                                    helperText={
                                        errors.factory_reset_status?.message
                                    }
                                    sx={{ mt: 2 }}
                                >
                                    <MenuItem
                                        value="Yes"
                                        onClick={(e) => {
                                            setResFact('Yes')
                                        }}
                                    >
                                        YES
                                    </MenuItem>
                                    <MenuItem
                                        value="NO"
                                        onClick={(e) => {
                                            setResFact('NO')
                                        }}
                                    >
                                        NO
                                    </MenuItem>
                                </Select>
                            </FormControl>
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
                        // disabled={
                        //     addButDis ||
                        //     (bqcStatus === 'BQC Finished' && restFact == 'NO')
                        // }
                        style={{ backgroundColor: 'green' }}
                        component="span"
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                    >
                        Add
                    </Button>
                </DialogActions>
            </BootstrapDialog>
            <Box
                sx={{
                    mt: 1,
                    height: 70,
                    borderRadius: 1,
                }}
            >
                <Box
                    sx={{
                        float: 'left',
                    }}
                >
                    <h4 style={{ marginLeft: '13px' }}>TRAY ID - {trayId}</h4>
                    <h4 style={{ marginLeft: '13px' }}>
                        AGENT NAME - {trayData?.issued_user_name}
                    </h4>
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
                    <textarea
                        onChange={(e) => {
                            setDescription(e.target.value)
                        }}
                        style={{ width: '300px', height: '60px' }}
                        placeholder="Description"
                    ></textarea>
                    <Button
                        sx={{ m: 3, mb: 9 }}
                        variant="contained"
                        disabled={
                            loading ||
                            description == '' ||
                            trayData?.items?.length !==
                                trayData?.actual_items?.length
                        }
                        style={{ backgroundColor: 'green' }}
                        onClick={() => {
                            handelIssue()
                        }}
                    >
                        Tray Close
                    </Button>
                </Box>
            </div>
        </>
    )
}
