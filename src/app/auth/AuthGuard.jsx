import useAuth from 'app/hooks/useAuth'
import { flat } from 'app/utils/utils'
import React, { useState, useEffect } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AllPages } from '../routes/routes'
import Swal from 'sweetalert2'
// import jwt from "jsonwebtoken"
import jwt_decode from 'jwt-decode'
import { axiosSuperAdminPrexo } from '../../axios'

const getUserRoleAuthStatus = (pathname, user, routes) => {
    if (!user) {
        return false
    }
    const matched = routes.find((r) => r.path === pathname)
    const authenticated =
        matched && matched.auth && matched.auth.length
            ? matched.auth.includes(user.role)
            : true
    return authenticated
}
const AuthGuard = ({ children }) => {
    const { isAuthenticated, user } = useAuth()
    const [previouseRoute, setPreviousRoute] = useState(null)
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const routes = flat(AllPages())

    const isUserRoleAuthenticated = getUserRoleAuthStatus(
        pathname,
        user,
        routes
    )
    let authenticated = isAuthenticated && isUserRoleAuthenticated

    // IF YOU NEED ROLE BASED AUTHENTICATION,
    // UNCOMMENT ABOVE TWO LINES, getUserRoleAuthStatus METHOD AND user VARIABLE
    // AND COMMENT OUT BELOW LINE
    // let authenticated = isAuthenticated

    useEffect(() => {
        const checkUserActiveOrNot = async () => {
            try {
                let user = localStorage.getItem('prexo-authentication')
                if (user) {
                    let { user_name, user_type } = jwt_decode(user)
                    if (user_name == undefined || user_type == undefined) {
                        navigate('/')
                    } else {
                        let obj = {
                            username: user_name,
                            jwt: user,
                            user_type: user_type,
                        }
                        let res = await axiosSuperAdminPrexo.post(
                            '/check-user-status',
                            obj
                        )
                        if (res.status === 200) {
                        } else if (res.status == 202) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: res.data.message,
                                allowOutsideClick: false,
                                allowEscapeKey: false,
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    localStorage.removeItem(
                                        'prexo-authentication'
                                    )
                                    navigate('/')
                                }
                            })
                        }
                    }
                } else {
                    navigate('/')
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error,
                })
            }
        }
        checkUserActiveOrNot()
        if (previouseRoute !== null) setPreviousRoute(pathname)
    }, [pathname, previouseRoute])

    if (authenticated) return <>{children}</>
    else {
        return <Navigate to="/" state={{ redirectUrl: previouseRoute }} />
    }
}

export default AuthGuard
