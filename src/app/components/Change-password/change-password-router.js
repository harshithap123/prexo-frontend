import React, { lazy } from 'react'
import Loadable from '../../components/Loadable/Loadable'

const ChangePassword = Loadable(lazy(() => import('./change -password')))

const ChangePasswordRouter = [
    {
        path: '/change-password',
        element: <ChangePassword />,
    },
]

export default ChangePasswordRouter
