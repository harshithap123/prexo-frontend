import React, { useEffect, useState, useMemo } from 'react'
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
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Container,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import LoadingButton from '@mui/lab/LoadingButton'
import { axiosBot } from '../../../../axios'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Swal from 'sweetalert2'

// import jwt from "jsonwebtoken"
import jwt_decode from 'jwt-decode'
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
/******************************************************************************** */
export default function DialogBox() {
    const [open, setOpen] = React.useState(false)
    const [openApprove, setOpenApprove] = useState(false)
    const [openProductMismatch, setOpneProductMisMatch] = useState(false)
    const [openModelMisMatch, setModelMisMatch] = useState(false)
    const [refresh, setRefresh] = useState(false)
    const navigate = useNavigate()
    const [bagData, setBagData] = useState([])
    const { bagId } = useParams()
    const [count, setCount] = useState(0)
    /**************************************************************************** */
    const [awabnDetails, setAwbnDetails] = useState([])
    /***************************************************************************************** */
    const [stickerOne, setStickerOne] = useState('')
    const [stickerTwo, setStickerTwo] = useState('')
    const [stickertThree, setStickerThree] = useState('')
    const [bodyDamageDes, setBodyDamageDes] = useState('')
    const [itemRecievedDet, setItemRecieveDet] = useState('')
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(false)
    const [awbn, setAwbn] = useState('')
    const [bodyDamage, setBodyDamage] = useState('NO')
    const [textBoxDis, setTextBoxDis] = useState(false)
    /******************************************************************************** */
    let admin = localStorage.getItem('prexo-authentication')
    let user_name1
    if (admin) {
        let { user_name } = jwt_decode(admin)
        user_name1 = user_name
    }

    useEffect(() => {
        const fetchData = async () => {
            setCount(0)
            setPageLoading(false)
            try {
                let obj = {
                    bagId: bagId,
                    username: user_name1,
                }
                let response = await axiosBot.post('/getAssignedBagItems', obj)
                if (response.status === 200) {
                    setBagData(response.data.data)
                    setPageLoading(true)
                }
            } catch (error) {
                setPageLoading(true)
                if (error.response.status == 201) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: error.response.data.message,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/bot/bag')
                        }
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        confirmButtonText: 'Ok',
                        text: error,
                    })
                }
            }
        }
        fetchData()
    }, [refresh])

    useEffect(() => {
        setCount(0)
        if (bagData?.[1]?.tray !== undefined) {
            for (let x of bagData?.[1]?.tray) {
                setCount(
                    (count) =>
                        count +
                        x?.items.filter(
                            (data) =>
                                data.bag_id == bagId &&
                                data.bag_assigned_date ==
                                    bagData[0]?.assigned_date
                        ).length
                )
            }
        }
    }, [bagData])

    /************************************************************************************* */
    const handleClose = () => {
        setOpen(false)
    }
    const handleCloseProductMisMatch = () => {
        setStickerOne('')
        setStickerTwo('')
        setStickerThree('')
        setItemRecieveDet('')
        setBodyDamageDes('')
        setOpneProductMisMatch(false)
        setBodyDamage('NO')
    }
    const handleCloseApprove = () => {
        setStickerOne('')
        setStickerTwo('')
        setStickerThree('')
        setBodyDamageDes('')
        setItemRecieveDet('')
        setOpenApprove(false)
        setBodyDamage('NO')
    }
    const handleCloseModelMisMatch = () => {
        setStickerOne('')
        setStickerTwo('')
        setStickerThree('')
        setItemRecieveDet('')
        setBodyDamageDes('')
        setModelMisMatch(false)
        setBodyDamage('NO')
    }

    /***************************************************************************************** */
    // BAG AND BOT TRAY CLOSE
    const handelClosebag = async () => {
        try {
            setLoading(true)
            if (bagData[0]?.actual_items?.length === count) {
                let botTray = bagData[1]?.tray?.filter(
                    (data) => data.type_taxanomy == 'BOT'
                )
                let obj = {
                    bagId: bagId,
                    trayId: botTray[0].code,
                    username: botTray[0].issued_user_name,
                }
                let res = await axiosBot.post('/closeBag', obj)
                if (res.status === 200) {
                    setLoading(false)
                    Swal.fire({
                        icon: 'success',
                        title: res.data.message,
                        showConfirmButton: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/bot/bag')
                        }
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        confirmButtonText: 'Ok',
                        text: res.data.message,
                    })
                }
            } else {
                setLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    confirmButtonText: 'Ok',
                    text: 'Please Scan All Items',
                })
            }
        } catch (error) {
            setLoading(false)
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                confirmButtonText: 'Ok',
                text: error,
            })
        }
    }

    const handelAwbn = async (e) => {
        if (e.target.value.length >= 12) {
            try {
                let obj = {
                    bagId: bagId,
                    awbn_number: e.target.value,
                    username: user_name1,
                }
                setTextBoxDis(true)
                let res = await axiosBot.post('/awbnScanning', obj)
                if (res.status === 200) {
                    setAwbnDetails(res.data.data)
                    setAwbn('')
                    setOpen(true)
                } else if (res.status === 202) {
                    setTextBoxDis(false)
                    setAwbn('')
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        confirmButtonText: 'Ok',
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

    /************************************************************************************************* */
    const traySegrigation = async (e, trayType) => {
        if (e.keyCode !== 32) {
            setLoading(true)
            let tray = bagData[1].tray?.filter(function (item) {
                return (
                    item.type_taxanomy == trayType && item.sort_id == 'Issued'
                )
            })
            try {
                if (trayType == 'MMT' && tray?.length !== 0) {
                    if (tray[0]?.limit <= tray?.[0]?.items?.length) {
                        if (tray[0]?.sort_id == 'Issued') {
                            Swal.fire({
                                title: 'Tray Is Full',
                                text: 'You Want to Close Tray?',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes,close!',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    handelCloseTray(tray[0].code)
                                }
                            })
                        } else {
                            setLoading(false)
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                confirmButtonText: 'Ok',
                                text: 'Tray already closed',
                            })
                        }
                    } else {
                        let obj = {
                            awbn_number: awabnDetails?.[0]?.tracking_id,
                            order_id: awabnDetails?.[0]?.order_id,
                            order_date: awabnDetails?.[0]?.order_date,
                            imei: awabnDetails?.[0]?.imei,
                            stickerOne: stickerOne,
                            stickerTwo: stickerTwo,
                            stickerThree: stickertThree,
                            status: awabnDetails?.[0].status,
                            tray_id: tray[0].code,
                            bag_id: bagId,
                            user_name: user_name1,
                            body_damage: bodyDamage,
                            body_damage_des: bodyDamageDes,
                            model_brand: itemRecievedDet,
                            bag_assigned_date: bagData[0]?.assigned_date,
                            uic:
                                awabnDetails?.[0]?.uic_code?.code == undefined
                                    ? 'PENDING'
                                    : awabnDetails?.[0]?.uic_code?.code,
                        }
                        let res = await axiosBot.post('/traySegregation', obj)
                        if (res.status == 200) {
                            setTextBoxDis(false)
                            setLoading(false)
                            setRefresh((refresh) => !refresh)
                            setStickerOne('')
                            setStickerTwo('')
                            setStickerThree('')
                            setBodyDamage('NO')
                            setModelMisMatch(false)
                        } else if (res.status == 202) {
                            setLoading(false)
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                confirmButtonText: 'Ok',
                                text: res.data.data,
                            })
                        }
                    }
                } else if (tray?.length !== 0) {
                    if (
                        tray[0].limit <= tray?.[0]?.items?.length &&
                        trayType == 'BOT'
                    ) {
                        setLoading(false)
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            confirmButtonText: 'Ok',
                            text: 'Tray Is Full',
                        })
                    } else if (
                        tray[0].limit <= tray?.[0]?.items?.length &&
                        trayType == 'PMT'
                    ) {
                        if (tray[0]?.sort_id == 'Issued') {
                            Swal.fire({
                                title: 'Tray Is Full',
                                text: 'You Want to Close Tray?',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Yes,close!',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    handelCloseTray(tray[0].code)
                                }
                            })
                        } else {
                            setLoading(false)
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                confirmButtonText: 'Ok',
                                text: 'Tray already closed',
                            })
                        }
                    } else {
                        let obj = {
                            awbn_number: awabnDetails?.[0]?.tracking_id,
                            order_id: awabnDetails?.[0]?.order_id,
                            order_date: awabnDetails?.[0]?.order_date,
                            imei: awabnDetails?.[0]?.imei,
                            stickerOne: stickerOne,
                            stickerTwo: stickerTwo,
                            status: awabnDetails?.[0].status,
                            tray_id: tray[0].code,
                            bag_id: bagId,
                            bag_assigned_date: bagData[0]?.assigned_date,
                            user_name: user_name1,
                            uic:
                                awabnDetails?.[0]?.uic_code?.code == undefined
                                    ? 'PENDING'
                                    : awabnDetails?.[0]?.uic_code?.code,
                            body_damage: bodyDamage,
                            body_damage_des: bodyDamageDes,
                            item_recieved: itemRecievedDet,
                        }
                        let res = await axiosBot.post('/traySegregation', obj)
                        if (res.status == 200) {
                            setTextBoxDis(false)
                            setLoading(false)
                            setRefresh((refresh) => !refresh)
                            setStickerOne('')
                            setStickerTwo('')
                            setItemRecieveDet('')
                            setBodyDamageDes('')
                            setOpenApprove(false)
                            setBodyDamage('NO')
                            setOpneProductMisMatch(false)
                        } else if (res.status == 202) {
                            setLoading(false)
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                confirmButtonText: 'Ok',
                                text: res.data.data,
                            })
                        }
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        confirmButtonText: 'Ok',
                        text: 'Tray Is full',
                    })
                    setStickerOne('')
                    setStickerTwo('')
                    setStickerThree('')
                    setOpenApprove(false)
                    setModelMisMatch(false)
                    setBodyDamage('NO')
                    setItemRecieveDet('')
                    setBodyDamageDes('')
                    setOpneProductMisMatch(false)
                    setLoading(false)
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
    // TRAY CLOSE
    const handelCloseTray = async (trayid) => {
        try {
            let res = await axiosBot.post('/trayClose/' + trayid)
            if (res.status == 200) {
                Swal.fire({
                    icon: 'success',
                    title: res.data.message,
                    confirmButtonText: 'Ok',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        setLoading(false)
                        setRefresh((refresh) => !refresh)
                        setOpneProductMisMatch(false)
                        setModelMisMatch(false)
                    }
                })
            } else if (res.status === 202) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    confirmButtonText: 'Ok',
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
    /***************************************************************************************** */
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } }
    const table = useMemo(() => {
        return (
            <Grid container spacing={2}>
                {bagData[1]?.tray?.map((data, index) => (
                    <Grid item xs={12} md={4}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <h4 style={{ paddingLeft: '10px' }}>
                                {' '}
                                {data.type_taxanomy +
                                    '-' +
                                    data.code +
                                    ' (' +
                                    bagData[1]?.tray?.[index]?.items?.length +
                                    '/' +
                                    data.limit +
                                    ')  '}
                            </h4>
                            {data.sort_id == 'Closed By Bot' ||
                            data.sort_id == 'Received From BOT' ||
                            data.sort_id == 'Closed By Warehouse' ? (
                                <h5 style={{ color: 'red' }}>-Tray Closed</h5>
                            ) : (
                                ''
                            )}
                        </Box>
                        <Paper sx={{ width: '95%', overflow: 'hidden', m: 1 }}>
                            <TableContainer>
                                <Table
                                    style={{ width: '100%' }}
                                    id="example"
                                    stickyHeader
                                    aria-label="sticky table"
                                    
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell pl={{pl:2}}>S.NO</TableCell>
                                            <TableCell>AWBN Number</TableCell>
                                            <TableCell>Order ID</TableCell>
                                            <TableCell>Order Date</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data?.items?.map((itemData, index) => (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                tabIndex={-1}
                                            >
                                                <TableCell sx={{pl:3}}>
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {itemData.awbn_number}
                                                </TableCell>
                                                <TableCell>
                                                    {itemData.order_id}
                                                </TableCell>

                                                <TableCell>
                                                    {' '}
                                                    {itemData.order_date == null
                                                        ? 'No Order Date'
                                                        : new Date(
                                                              itemData.order_date
                                                          ).toLocaleString(
                                                              'en-GB',
                                                              {
                                                                  year: 'numeric',
                                                                  month: '2-digit',
                                                                  day: '2-digit',
                                                              }
                                                          )}
                                                </TableCell>
                                                <TableCell
                                                    style={
                                                        itemData.status ==
                                                        'Valid'
                                                            ? { color: 'green' }
                                                            : { color: 'red' }
                                                    }
                                                >
                                                    {itemData.status}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        )
    }, [bagData[1]?.tray])

    return (
        <>
            <BootstrapDialog
                aria-labelledby="customized-dialog-title"
                open={open}
                fullWidth
                maxWidth="lg"
            >
                <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={handleClose}
                >
                    DETAILS
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
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <h3>AWBN:-{awabnDetails?.[0]?.tracking_id}</h3>
                                <h3>
                                    UIC :-{' '}
                                    {awabnDetails?.[0]?.uic_code?.code ==
                                    undefined
                                        ? 'PENDING'
                                        : awabnDetails?.[0]?.uic_code?.code}
                                </h3>
                                <h3>
                                    BRAND :-{' '}
                                    {awabnDetails?.[0]?.products?.brand_name}
                                </h3>
                                <h3>
                                    MODEL :-{' '}
                                    {awabnDetails?.[0]?.products?.model_name}
                                </h3>
                                <h3>
                                    MUIC :- {awabnDetails?.[0]?.products?.muic}
                                </h3>
                                <FormControl
                                    variant="standard"
                                    sx={{ width: '220px' }}
                                >
                                    <InputLabel id="demo-simple-select-standard-label">
                                        Status
                                    </InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        label="Select Status"
                                    >
                                        <MenuItem
                                            onClick={(e) => {
                                                setOpen(false)
                                                setOpenApprove(true)
                                            }}
                                            value="approve"
                                        >
                                            Approve
                                        </MenuItem>
                                        <MenuItem
                                            onClick={(e) => {
                                                setOpen(false)
                                                setOpneProductMisMatch(true)
                                            }}
                                            value="product_mismatch"
                                        >
                                            Product Mismatch
                                        </MenuItem>
                                        <MenuItem
                                            onClick={(e) => {
                                                setOpen(false)
                                                setModelMisMatch(true)
                                            }}
                                            value="model_mismatch"
                                        >
                                            Model Mismatch
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <img
                                    height="auto"
                                    width="400px"
                                    alt="No product image"
                                    src={
                                        awabnDetails?.[0]?.products.image ==
                                        undefined
                                            ? 'https://prexo-v8-4-dev-api.dealsdray.com/product/image/' +
                                              awabnDetails?.[0]?.products
                                                  .vendor_sku_id +
                                              '.jpg'
                                            : awabnDetails?.[0]?.products.image
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions></DialogActions>
            </BootstrapDialog>
            <BootstrapDialog
                aria-labelledby="customized-dialog-title"
                open={openApprove}
                fullWidth
                maxWidth="xs"
            >
                <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={handleCloseApprove}
                >
                    ADD TO BOT
                </BootstrapDialogTitle>
                <DialogContent dividers>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            flexDirection: 'column',
                            p: 1,

                            bgcolor: 'background.paper',
                            borderRadius: 1,
                        }}
                    >
                        <label>
                            {' '}
                            <Checkbox
                                onClick={(e) => {
                                    stickerOne == ''
                                        ? setStickerOne('UIC Pasted On Device')
                                        : setStickerOne('')
                                }}
                                {...label}
                                sx={{ ml: 1 }}
                            />
                            UIC Pasted On Device
                        </label>
                        <label>
                            {' '}
                            <Checkbox
                                onClick={(e) => {
                                    stickerTwo == ''
                                        ? setStickerTwo('Device Putin Sleeve')
                                        : setStickerTwo('')
                                }}
                                {...label}
                                sx={{ ml: 1 }}
                            />
                            Device Putin Sleeve
                        </label>
                        {/* <h6>
              {" "}
              <Checkbox
                onClick={(e) => {
                  stickertThree == ""
                    ? setStickerThree("UIC Pasted On Sleeve")
                    : setStickerThree("");
                }}
                {...label}
                sx={{ ml: 3 }}
              />
              UIC Pasted On Sleeve
            </h6> */}
                        <FormControl sx={{ ml: 3 }}>
                            <FormLabel id="demo-radio-buttons-group-label">
                                Any Damage
                            </FormLabel>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                defaultValue="NO"
                                name="radio-buttons-group"
                            >
                                <Box>
                                    <FormControlLabel
                                        value="YES"
                                        onClick={(e) => {
                                            setBodyDamage('YES')
                                        }}
                                        control={<Radio />}
                                        label="YES"
                                    />
                                    <FormControlLabel
                                        value="NO"
                                        control={<Radio />}
                                        onClick={(e) => {
                                            setBodyDamage('NO')
                                        }}
                                        label="NO"
                                    />
                                </Box>
                            </RadioGroup>
                        </FormControl>
                        {bodyDamage == 'YES' ? (
                            <TextField
                                label="Details of damage parts"
                                maxWidth="50px"
                                onChange={(e) => {
                                    setBodyDamageDes(e.target.value)
                                }}
                                style={{
                                    width: '300px',
                                    marginLeft: '22px',
                                    height: '60px',
                                }}
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
                        style={{ backgroundColor: 'green' }}
                        disabled={
                            loading ||
                            stickerOne == '' ||
                            stickerTwo == '' ||
                            (bodyDamage === 'YES' && bodyDamageDes === '')
                        }
                        component="span"
                        onClick={(e) => {
                            traySegrigation(e, 'BOT')
                        }}
                    >
                        Add To Bot
                    </Button>
                </DialogActions>
            </BootstrapDialog>
            <BootstrapDialog
                aria-labelledby="customized-dialog-title"
                open={openProductMismatch}
                fullWidth
                maxWidth="xs"
            >
                <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={handleCloseProductMisMatch}
                >
                    ADD TO PMT
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
                        <label style={{ marginLeft: '19px' }}>
                            UIC : - {awabnDetails?.[0]?.uic_code?.code}
                        </label>
                        <label
                            style={{ marginLeft: '19px', marginTop: '10px' }}
                        >
                            AWBN : - {awabnDetails?.[0]?.tracking_id}
                        </label>
                        <label>
                            {' '}
                            <Checkbox
                                onClick={(e) => {
                                    stickerOne == ''
                                        ? setStickerOne('UIC Pasted On Sleeve')
                                        : setStickerOne('')
                                }}
                                {...label}
                                sx={{ ml: 1 }}
                            />
                            UIC Pasted On Sleeve
                        </label>
                        <TextField
                            label="Item received in packet"
                            variant="outlined"
                            onChange={(e) => {
                                setItemRecieveDet(e.target.value)
                            }}
                            sx={{ ml: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            ml: 2,
                        }}
                        fullwidth
                        variant="contained"
                        disabled={
                            loading ||
                            stickerOne === '' ||
                            itemRecievedDet === ''
                        }
                        style={{ backgroundColor: 'green' }}
                        component="span"
                        onClick={(e) => {
                            traySegrigation(e, 'PMT')
                        }}
                    >
                        Add To PMT
                    </Button>
                </DialogActions>
            </BootstrapDialog>
            <BootstrapDialog
                aria-labelledby="customized-dialog-title"
                open={openModelMisMatch}
                fullWidth
                maxWidth="xs"
            >
                <BootstrapDialogTitle
                    id="customized-dialog-title"
                    onClose={handleCloseModelMisMatch}
                >
                    ADD TO MMT
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
                        <label style={{ marginLeft: '12px' }}>
                            Model Name : -{' '}
                            {awabnDetails?.[0]?.products?.model_name}
                        </label>
                        <label style={{ marginLeft: '12px' }}>
                            IMEI : - {awabnDetails?.[0]?.imei}
                        </label>
                        <label>
                            {' '}
                            <Checkbox
                                onClick={(e) => {
                                    stickerOne == ''
                                        ? setStickerOne('Blank Sticker Pasted')
                                        : setStickerOne('')
                                }}
                                {...label}
                            />
                            Blank Sticker Pasted
                        </label>
                        <label>
                            {' '}
                            <Checkbox
                                onClick={(e) => {
                                    stickerTwo == ''
                                        ? setStickerTwo('UIC Writen On Sticker')
                                        : setStickerTwo('')
                                }}
                                {...label}
                            />
                            UIC Writen On Sticker
                        </label>
                        <label>
                            {' '}
                            <Checkbox
                                onClick={(e) => {
                                    stickertThree == ''
                                        ? setStickerThree(
                                              'Device Put On Sleeve'
                                          )
                                        : setStickerThree('')
                                }}
                                {...label}
                            />
                            Device Put On Sleeve
                        </label>

                        <FormControl sx={{ ml: 2 }}>
                            <FormLabel id="demo-radio-buttons-group-label">
                                Any Damage
                            </FormLabel>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                defaultValue="NO"
                                name="radio-buttons-group"
                            >
                                <Box>
                                    <FormControlLabel
                                        value="YES"
                                        onClick={(e) => {
                                            setBodyDamage('YES')
                                        }}
                                        control={<Radio />}
                                        label="YES"
                                    />
                                    <FormControlLabel
                                        value="NO"
                                        control={<Radio />}
                                        onClick={(e) => {
                                            setBodyDamage('NO')
                                        }}
                                        label="NO"
                                    />
                                </Box>
                            </RadioGroup>
                        </FormControl>
                        {bodyDamage == 'YES' ? (
                            <TextField
                                label="Details of damage parts"
                                maxWidth="50px"
                                onChange={(e) => {
                                    setBodyDamageDes(e.target.value)
                                }}
                                style={{
                                    width: '300px',
                                    marginLeft: '18px',
                                    height: '60px',
                                }}
                            />
                        ) : null}
                        <TextField
                            label="Mismatched model brand name"
                            variant="outlined"
                            onChange={(e) => {
                                setItemRecieveDet(e.target.value)
                            }}
                            style={{
                                width: '300px',
                                marginLeft: '18px',
                                height: '60px',
                            }}
                            sx={{ mt: 1, ml: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{
                            ml: 2,
                        }}
                        fullwidth
                        variant="contained"
                        disabled={
                            loading ||
                            stickerOne === '' ||
                            stickerTwo === '' ||
                            stickertThree === '' ||
                            itemRecievedDet === '' ||
                            (bodyDamage === 'YES' && bodyDamageDes === '')
                        }
                        style={{ backgroundColor: 'green' }}
                        component="span"
                        onClick={(e) => {
                            setLoading(true)

                            traySegrigation(e, 'MMT')
                        }}
                    >
                        Add To MMT
                    </Button>
                </DialogActions>
            </BootstrapDialog>
            {pageLoading === false ? (
                <Container>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column',
                            pt: 30,
                        }}
                    >
                        <CircularProgress />
                        <p style={{ paddingTop: '10px' }}>Loading...</p>
                    </Box>
                </Container>
            ) : (
                <Box sx={{ mt: 1 }}>
                    <Box>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <h3 style={{ marginLeft: '10px' }}>
                                    Bag Id : -{bagId}
                                </h3>
                                <h4 style={{ marginLeft: '10px' }}>
                                    Assigned On : -
                                    {new Date(
                                        bagData[0]?.assigned_date
                                    ).toLocaleString('en-GB', {
                                        hour12: true,
                                    })}
                                </h4>
                            </Grid>
                            <Grid item xs={8}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row-reverse',
                                        mr: 3,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            ml: 2,
                                        }}
                                    >
                                        <h5 style={{ paddingLeft: '16px' }}>
                                            Sleeves
                                        </h5>
                                        <Checkbox
                                            checked={
                                                bagData[0]?.sleaves == 'true'
                                                    ? true
                                                    : false
                                            }
                                            {...label}
                                            sx={{ ml: 3 }}
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            ml: 2,
                                        }}
                                    >
                                        <h5 style={{ paddingLeft: '30px' }}>
                                            UIC
                                        </h5>
                                        <Checkbox
                                            checked={
                                                bagData[0]?.uic == 'true'
                                                    ? true
                                                    : false
                                            }
                                            {...label}
                                            sx={{ ml: 3 }}
                                        />
                                    </Box>

                                    <Box
                                        sx={{
                                            ml: 4,
                                        }}
                                    >
                                        <h5>
                                            Valid
                                            <p
                                                style={{
                                                    paddingLeft: '6px',
                                                    fontSize: '22px',
                                                }}
                                            >
                                                {
                                                    bagData[0]?.actual_items?.filter(
                                                        function (item) {
                                                            return (
                                                                item.status ==
                                                                'Valid'
                                                            )
                                                        }
                                                    ).length
                                                }
                                            </p>
                                        </h5>
                                    </Box>
                                    <Box
                                        sx={{
                                            ml: 4,
                                        }}
                                    >
                                        <h4>
                                            Total
                                            <p
                                                style={{
                                                    paddingLeft: '1px',
                                                    fontSize: '22px',
                                                }}
                                            >
                                                {count}/
                                                {
                                                    bagData[0]?.actual_items?.filter(
                                                        function (item) {
                                                            return (
                                                                item.status !=
                                                                'Duplicate'
                                                            )
                                                        }
                                                    ).length
                                                }
                                            </p>
                                        </h4>
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                    <Box sx={{ maxHeight: '4px' }}>
                        <TextField
                            sx={{ ml: 1 }}
                            id="outlined-password-input"
                            type="text"
                            autoComplete="off"
                            name="doorsteps_diagnostics"
                            label="SCAN AWBN"
                            value={awbn}
                            onChange={(e) => {
                                setAwbn(e.target.value)
                                handelAwbn(e)
                            }}
                            inputProps={{
                                style: {
                                    width: 'auto',
                                },
                            }}
                        />
                    </Box>
                    <Box sx={{ mt: 10 }}>{table}</Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'end',
                            mt: 2,
                            mr: 3,
                            ml: 3,
                            mb: 2,
                        }}
                    >
                        <Box>
                            <LoadingButton
                                sx={{
                                    ml: 2,
                                }}
                                fullwidth
                                variant="contained"
                                loadingPosition="end"
                                loading={loading}
                                disabled={
                                    bagData[0]?.actual_items?.length !== count
                                }
                                style={{ backgroundColor: 'red' }}
                                component="span"
                                onClick={(e) => {
                                    if (window.confirm('You want to Close?')) {
                                        handelClosebag(e)
                                    }
                                }}
                            >
                                Bag Close
                            </LoadingButton>
                        </Box>
                    </Box>
                </Box>
            )}
        </>
    )
}
