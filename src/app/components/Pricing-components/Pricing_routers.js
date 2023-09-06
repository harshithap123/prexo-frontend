import React, { lazy } from 'react'
import Loadable from '../Loadable/Loadable'

const Dashboard = Loadable(lazy(() => import('./Dashboard/Dashboard')))
// const Tray = Loadable(lazy(() => import('./Tray/tray')))
// const TraySegregation = Loadable(lazy(() => import('./Tray/item-segrgation')))


const pricingRouter= [
    {
        path: '/pricing/dashboard',
        element: <Dashboard />,
    },
]

export default pricingRouter
