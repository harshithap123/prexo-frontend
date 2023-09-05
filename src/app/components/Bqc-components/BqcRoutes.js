import React, { lazy } from 'react'
import Loadable from '../Loadable/Loadable'

const Dashboard = Loadable(lazy(() => import('./Dashboard/dashboard')))
const Tray = Loadable(lazy(() => import('./Tray/tray')))
const TraySegregation = Loadable(lazy(() => import('./Tray/item-segrgation')))
const TrayBqcOut = Loadable(lazy(() => import('./Tray/bqc-out')))
const PromptPage = Loadable(lazy(() => import('./Tray/prompt-page')))


const BqcRouter= [
    {
        path: '/bqc/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/bqc/tray',
        element: <Tray />,
    },
    {
        path: '/bqc/tray/item-verify/prompt',
        element: <PromptPage />,
    },
    {
        path: '/bqc/tray/item-verify/:trayId',
        element: <TraySegregation />,
    },
    {
        path: '/bqc/tray/bqc-out/:trayId',
        element: <TrayBqcOut />,
    },
]

export default BqcRouter
