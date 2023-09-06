import React from 'react'
import StatCard3 from './card'
import { H3 } from 'app/components/Typography'
import { styled } from '@mui/system'

const AnalyticsRoot = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
}))

const FlexBox = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
}))





const Analytics2 = () => {
    return (
        <AnalyticsRoot>
            <FlexBox>
                <H3 sx={{ m: 0 }}>DASHBOARD</H3>
            </FlexBox>
            <StatCard3 />
        </AnalyticsRoot>
    )
}

export default Analytics2
