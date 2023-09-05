import React, { useEffect, useState } from 'react'
import { Box, useTheme } from '@mui/system'
import { H3, Paragraph } from 'app/components/Typography'
import { Grid, Card, IconButton, Icon } from '@mui/material'
import { axiosBot } from '../../../../axios'
import jwt_decode from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const StatCard3 = () => {
    const [count, setCount] = useState({})
    const navigate = useNavigate()
    
    useEffect(() => {
        const fetchData = async () => {
            let user = localStorage.getItem('prexo-authentication')
            if (user) {
                let { user_name } = jwt_decode(user)
                try {
                    let res = await axiosBot.post('/dashboard/' + user_name)
                    if (res.status === 200) {
                        setCount(res.data.data)
                    }
                } catch (error) {
                   
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text:error,
                    })
                }
            }
        }
        fetchData()
    }, [])

    const statList = [
        {
            icon: 'class',
            amount: count.bag,
            title: 'Bag',
            path: '/bot/bag',
        },
        {
            icon: 'shopping_cart',
            amount: count.tray,
            title: 'Tray',
            path: '/bot/tray',
        },
    ]
    const { palette } = useTheme()
    const textMuted = palette.text.secondary

    return (
        <div>
            <Grid container spacing={3}>
                {statList.map((item, ind) => (
                    <Grid key={item.title} item md={3} sm={6} xs={12}>
                        <Card
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                                navigate(item.path)
                            }}
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
                ))}
            </Grid>
        </div>
    )
}

export default StatCard3
