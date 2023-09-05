import React, { useEffect, useState, useMemo } from 'react'
import { styled } from '@mui/material/styles'
import { Box, Button, TextField } from '@mui/material'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
// import jwt from "jsonwebtoken"
import Swal from 'sweetalert2'
import { axiosBqc } from '../../../../axios'

export default function DialogBox() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const { trayData, resDataUic, trayId } = state
    const [deviceButDis, setDeviceButDis] = useState(false)

    /*********************************************************** */

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
                try {
                    resDataUic.bqc_status = value
                    let objData = {
                        condiation: type,
                        trayId: trayId,
                        item: resDataUic,
                    }
                    setDeviceButDis(true)
                    let res = await axiosBqc.post('/add-wht-item', objData)
                    if (res.status == 200) {
                        navigate('/bqc/tray/item-verify/' + trayId)
                        setDeviceButDis(false)
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

    return (
        <Box
            sx={{
                textAlign: 'center', // Add this line for center alignment
                alignItems: 'center',
                p: 1,
                m: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    ml: 10,
                    mr: 10,
                    flexDirection: 'column',
                }}
            >
                <TextField
                    label="UIC"
                    variant="outlined"
                    type="text"
                    value={resDataUic?.uic}
                    disabled={
                        resDataUic?.uic == '' || resDataUic?.uic == undefined
                    }
                    sx={{ mt: 2 }}
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
                />
                <TextField
                    label="Battery Status"
                    variant="outlined"
                    type="text"
                    value={resDataUic?.charging?.battery_status}
                    disabled={
                        resDataUic?.charging?.battery_status == '' ||
                        resDataUic?.charging?.battery_status == undefined
                    }
                    sx={{ mt: 2 }}
                />
                <TextField
                    label="Charge Percentage"
                    variant="outlined"
                    type="text"
                    value={resDataUic?.charging?.charge_percentage}
                    disabled={
                        resDataUic?.charging?.charge_percentage == '' ||
                        resDataUic?.charging?.charge_percentage == undefined
                    }
                    sx={{ mt: 2 }}
                />
                <TextField
                    label="Body Condition"
                    variant="outlined"
                    type="text"
                    value={resDataUic?.charging?.body_condition}
                    disabled={
                        resDataUic?.charging?.body_condition == '' ||
                        resDataUic?.charging?.body_condition == undefined
                    }
                    sx={{ mt: 2 }}
                />
                <TextField
                    label="Display Condition"
                    variant="outlined"
                    type="text"
                    value={resDataUic?.charging?.display_condition}
                    disabled={
                        resDataUic?.charging?.display_condition == '' ||
                        resDataUic?.charging?.display_condition == undefined
                    }
                    sx={{ mt: 2 }}
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
                />
                <TextField
                    label="Charging Jack Type"
                    variant="outlined"
                    type="text"
                    sx={{ mt: 2 }}
                    disabled={
                        resDataUic?.charging?.charging_jack_type == '' ||
                        resDataUic?.charging?.charging_jack_type == undefined
                    }
                    value={resDataUic?.charging?.charging_jack_type}
                />
                <TextField
                    label="Any Body Part Missing"
                    variant="outlined"
                    type="text"
                    disabled={
                        resDataUic?.charging?.boady_part_missing == '' ||
                        resDataUic?.charging?.boady_part_missing == undefined
                    }
                    value={resDataUic?.charging?.boady_part_missing}
                    sx={{ mt: 2 }}
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
                    />
                ) : null}
            </Box>
            <Box
                sx={{
                    mt: 4,
                }}
            >
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
            </Box>
        </Box>
    )
}
