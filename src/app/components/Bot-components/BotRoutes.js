import React, { lazy } from 'react'
import Loadable from '../Loadable/Loadable'

const Dashboard = Loadable(lazy(() => import('./Dashboard/dashboard')))
const Bag = Loadable(lazy(() => import('./Bag/view-assigned-all-bag')))
const BagView = Loadable(lazy(() => import('./Bag/bot-tray-transcation')))
const Tray = Loadable(lazy(() => import('./Tray/assigned-all-tray')))
const ViewTrayItem= Loadable(lazy(() => import('./Tray/view-item-tray')))

const BotRouter = [
    {
        path: '/bot/dashboard',
        element: <Dashboard />,
    },
    {
        path: '/bot/bag',
        element: <Bag />,
    },
    {
        path: '/bot/tray',
        element: <Tray />,
    },
    {
        path: '/bot/tray/item/:trayId',
        element: <ViewTrayItem />,
    },
    {
        path: '/bot/bag/view/:bagId',
        element: <BagView />,
    },
]

export default BotRouter
