import React, { lazy } from 'react'
import Loadable from '../Loadable/Loadable'

const Dashboard = Loadable(lazy(() => import('./Dashboard/dashboard')))
const Tray = Loadable(lazy(() => import('./Tray/tray')))
const TrayChargingIn = Loadable(lazy(() => import('./Tray/charging-in')))
const TrayChargingOut = Loadable(lazy(() => import('./Tray/charging-out')))


const ChargingRouter= [
    {
        path: '/charging/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/charging/tray',
        element: <Tray />,
    },
    {
        path: '/charging/tray/charging-in/:trayId',
        element: <TrayChargingIn />,
    },
    {
        path: '/charging/tray/charging-out/:trayId',
        element: <TrayChargingOut />,
    },
]

export default ChargingRouter
