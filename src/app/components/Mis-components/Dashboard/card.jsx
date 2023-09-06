import React, { useEffect, useState } from 'react'
import { Box, useTheme } from '@mui/system'
import { H3, Paragraph } from 'app/components/Typography'
import { Grid, Card, IconButton, Icon } from '@mui/material'
import { axiosMisUser } from '../../../../axios'
import jwt_decode from 'jwt-decode'
import useAuth from 'app/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const StatCard3 = () => {
    const [count, setCount] = useState({})
    const { logout, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            let user = localStorage.getItem('prexo-authentication')
            if (user) {
                let { location } = jwt_decode(user)
                try {
                    let res = await axiosMisUser.post(
                        '/dashboardData/' + location
                    )
                    if (res.status === 200) {
                        setCount(res.data.data)
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
        fetchData()
    }, [])

    const statList = [
        {
            icon: 'reorder',
            amount: count.orders,
            title: 'Orders',
            path: '/mis/orders',
            sales: false,
        },
        {
            icon: 'reorder',
            amount: count.badOrders,
            title: 'Bad Orders',
            path: '/mis/bad-orders',
            sales: false,
        },
        {
            icon: 'reorder',
            amount: count.delivered,
            title: 'Delivered Orders',
            path: '/mis/recon-sheet/delivered-orders',
            sales: false,
        },
        {
            icon: 'reorder',
            amount: count.notDelivered,
            title: 'Not Delivered Orders',
            path: '/mis/recon-sheet/not-delivered-orders',
            sales: false,
        },
        {
            icon: 'shopping_cart',
            amount: count.delivery,
            title: 'Delivery',
            path: '/mis/delivery',
            sales: false,
        },
        {
            icon: 'shopping_cart',
            amount: count.badDelivery,
            title: 'Bad Delivery',
            path: '/mis/bad-delivery',
            sales: false,
        },
        {
            icon: 'format_indent_decrease',
            amount: count.uicGented,
            title: 'UIC Generated',
            path: '/mis/uic-manage/uic-generated',
            sales: false,
        },
        {
            icon: 'format_indent_decrease',
            amount: count.uicNotGenrated,
            title: 'UIC Not Generated',
            path: '/mis/uic-manage/uic-not-generated',
            sales: false,
        },
        {
            icon: 'format_indent_decrease',
            amount: count.uicDownloaded,
            title: 'UIC Downloaded',
            path: '/mis/uic-manage/uic-downloaded',
            sales: false,
        },
        {
            icon: 'assignment',
            amount: count.assigBot,
            title: 'Assign To Bot',
            path: '/mis/assign-to-agent/bot',
            sales: false,
        },
        {
            icon: 'assignment',
            amount: count.assigCharging,
            title: 'Assign To Charging',
            path: '/mis/assign-to-agent/charging',
            sales: false,
        },
        {
            icon: 'assignment',
            amount: count.bqc,
            title: 'Assign To BQC',
            path: '/mis/assign-to-agent/bqc',
            sales: false,
        },
        {
            icon: 'assignment',
            amount: count.audit,
            title: 'Assign To Audit',
            path: '/mis/assign-to-agent/audit',
            sales: false,
        },

        {
            icon: 'art_track',
            amount: count.rdl,
            title: 'Assign To RDL-FLS',
            path: '/mis/assign-to-agent/Rdl-fls',
            sales: false,
        },
        {
            icon: 'art_track',
            amount: count.rdl_two,
            title: 'Assign To RDL-Repair',
            path: '/mis/assign-to-agent/rdl-two',
            sales: false,
        },
        {
            icon: 'sort',
            amount: count.botToWht,
            title: 'BOT To WHT',
            path: '/mis/sorting/bot-to-wht',
            sales: false,
        },
        {
            icon: 'sort',
            amount: count.ctxToStxSorting,
            title: 'CTX To STX',
            path: '/mis/sorting/ctx-to-stx',
            sales: true,
        },

        {
            icon: 'merge_type',
            amount: count.mmtMerge,
            title: 'MMT Merge',
            path: '/mis/merge/mmt',
            sales: false,
        },
        {
            icon: 'merge_type',
            amount: count.whtMerge,
            title: 'WHT Merge',
            path: '/mis/merge/wht',
            sales: false,
        },
        {
            icon: 'merge_type',
            amount: count.ctxMerge,
            title: 'CTX Merge',
            path: '/mis/merge/ctx',
            sales: false,
        },
        {
            icon: 'merge_type',
            amount: count.stxMerge,
            title: 'STX Merge',
            path: '/mis/merge/stx',
            sales: true,
        },
        {
            icon: 'shopping_cart',
            amount: count.readyToTransfer,
            title: 'Transfer CTX',
            path: '/mis/ctx/transfer',
            sales: 'all',
        },
        {
            icon: 'shopping_cart',
            amount: count.receiveCtx,
            title: 'Receive CTX',
            path: '/mis/ctx/receive',
            sales: 'all',
        },
        {
            icon: 'art_track',
            amount: count.trackItem,
            title: 'Track Item',
            path: '/mis/track/item',
            sales: 'all',
        },
    ]
    const { palette } = useTheme()
    const textMuted = palette.text.secondary

    return (
        <div>
            <Grid container spacing={3}>
                {statList.map((item, ind) =>
                    item?.sales == 'all' ? (
                        <Grid key={item.title} item md={3} sm={6} xs={12}>
                            <Card
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => navigate(item.path)}
                                elevation={3}
                                sx={{ p: '20px', display: 'flex' }}
                            >
                                <div>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            padding: '8px',
                                            background: 'rgba(0, 0, 0, 0.01)',
                                        }}
                                    >
                                        <Icon sx={{ color: textMuted }}>
                                            {item.icon}
                                        </Icon>
                                    </IconButton>
                                </div>
                                <Box ml={2}>
                                    <H3 sx={{ mt: '-4px', fontSize: '32px' }}>
                                        {item.amount}
                                    </H3>
                                    <Paragraph sx={{ m: 0, color: textMuted }}>
                                        {item.title}
                                    </Paragraph>
                                </Box>
                            </Card>
                        </Grid>
                    ) : item?.sales == true && user.cpc_type == 'Sales' ? (
                        <Grid key={item.title} item md={3} sm={6} xs={12}>
                            <Card
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => navigate(item.path)}
                                elevation={3}
                                sx={{ p: '20px', display: 'flex' }}
                            >
                                <div>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            padding: '8px',
                                            background: 'rgba(0, 0, 0, 0.01)',
                                        }}
                                    >
                                        <Icon sx={{ color: textMuted }}>
                                            {item.icon}
                                        </Icon>
                                    </IconButton>
                                </div>
                                <Box ml={2}>
                                    <H3 sx={{ mt: '-4px', fontSize: '32px' }}>
                                        {item.amount}
                                    </H3>
                                    <Paragraph sx={{ m: 0, color: textMuted }}>
                                        {item.title}
                                    </Paragraph>
                                </Box>
                            </Card>
                        </Grid>
                    ) : item?.sales == false && user.cpc_type !== 'Sales' ? (
                        <Grid key={item.title} item md={3} sm={6} xs={12}>
                            <Card
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => navigate(item.path)}
                                elevation={3}
                                sx={{ p: '20px', display: 'flex' }}
                            >
                                <div>
                                    <IconButton
                                        size="small"
                                        sx={{
                                            padding: '8px',
                                            background: 'rgba(0, 0, 0, 0.01)',
                                        }}
                                    >
                                        <Icon sx={{ color: textMuted }}>
                                            {item.icon}
                                        </Icon>
                                    </IconButton>
                                </div>
                                <Box ml={2}>
                                    <H3 sx={{ mt: '-4px', fontSize: '32px' }}>
                                        {item.amount}
                                    </H3>
                                    <Paragraph sx={{ m: 0, color: textMuted }}>
                                        {item.title}
                                    </Paragraph>
                                </Box>
                            </Card>
                        </Grid>
                    ) : null
                )}
            </Grid>
        </div>
    )
}

export default StatCard3
