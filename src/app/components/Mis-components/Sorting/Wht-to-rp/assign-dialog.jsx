import React, { useState } from 'react'
import { Dialog, Button, TextField, MenuItem } from '@mui/material'
import { Box, styled } from '@mui/system'
import { H4 } from 'app/components/Typography'
import { axiosMisUser } from '../../../../../axios'
import Swal from 'sweetalert2'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useForm } from 'react-hook-form'

const TextFieldCustOm = styled(TextField)(() => ({
    width: '100%',
    marginBottom: '16px',
}))

const FormHandlerBox = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}))

const MemberEditorDialog = ({
    handleClose,
    open,
    setIsAlive,
    requrementList,
    selectedUic,
    isCheck,
}) => {
    const [loading, setLoading] = useState(false)
    const schema = Yup.object().shape({
        rpTray: Yup.string().required('Required*').nullable(),
        spTray: Yup.string().required('Required*').nullable(),
        spwhuser: Yup.string().required('Required*').nullable(),
        sortingUser: Yup.string().required('Required*').nullable(),
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

    const onSubmit = async (values) => {
        try {
            setLoading(true)
            values.spDetails = isCheck
            values.selectedUic = selectedUic
            let res = await axiosMisUser.post('/whtToRpSorting/assign', values)
            if (res.status == 200) {
                Swal.fire({
                    position: 'top-center',
                    icon: 'success',
                    title: res?.data?.message,
                    confirmButtonText: 'Ok',
                })
                setIsAlive((isAlive) => !isAlive)
                handleClose()
            } else {
                setLoading(false)
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: res?.data?.message,
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
    return (
        <Dialog fullWidth maxWidth="xs" onClose={handleClose} open={open}>
            <Box p={3}>
                <H4 sx={{ mb: '20px' }}>Send to Sorting</H4>
                <TextFieldCustOm
                    label="Repair Tray"
                    fullWidth
                    select
                    {...register('rpTray')}
                    error={errors.rpTray ? true : false}
                    helperText={errors.rpTray?.message}
                    name="rpTray"
                >
                    {requrementList?.rpTray?.map((data) => (
                        <MenuItem key={data.code} value={data.code}>
                            {data.code} - ({data?.items?.length})
                        </MenuItem>
                    ))}
                </TextFieldCustOm>

                <TextFieldCustOm
                    label="SP Tray"
                    fullWidth
                    select
                    name="spTray"
                    {...register('spTray')}
                    error={errors.spTray ? true : false}
                    helperText={errors.spTray?.message}
                >
                    {requrementList?.spTray?.map((data) => (
                        <MenuItem key={data.code} value={data.code}>
                            {data.code}
                        </MenuItem>
                    ))}
                </TextFieldCustOm>
                <TextFieldCustOm
                    label="SPWH Agent"
                    fullWidth
                    select
                    name="spwhuser"
                    {...register('spwhuser')}
                    error={errors.spwhuser ? true : false}
                    helperText={errors.spwhuser?.message}
                >
                    {requrementList?.spWUser?.map((data) => (
                        <MenuItem key={data.user_name} value={data.user_name}>
                            {data.user_name}
                        </MenuItem>
                    ))}
                </TextFieldCustOm>
                <TextFieldCustOm
                    label="Sorting Agent"
                    fullWidth
                    select
                    name="sortingUser"
                    {...register('sortingUser')}
                    error={errors.sortingUser ? true : false}
                    helperText={errors.sortingUser?.message}
                >
                    {requrementList?.sortingAgent?.map((data) => (
                        <MenuItem key={data.user_name} value={data.user_name}>
                            {data.user_name}
                        </MenuItem>
                    ))}
                </TextFieldCustOm>
                <FormHandlerBox>
                    <Button
                        variant="contained"
                        disabled={loading}
                        onClick={handleSubmit(onSubmit)}
                        color="primary"
                        type="submit"
                    >
                        Assign
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleClose()}
                    >
                        Cancel
                    </Button>
                </FormHandlerBox>
            </Box>
        </Dialog>
    )
}

export default MemberEditorDialog
