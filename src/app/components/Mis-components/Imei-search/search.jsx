import { Breadcrumb } from 'app/components'
import React, { useState, useEffect, useMemo } from 'react'
import { styled } from '@mui/system'
// import { makeStyles } from '@material-ui/core/styles'
import { Container } from '@mui/material'
import Typography from '@mui/material/Typography'
import { axiosMisUser } from '../../../../axios'
import {
    Button,
    MenuItem,
    TableCell,
    TableHead,
    Table,
    TableRow,
    TableBody,
    Card,
    TablePagination,
    TextField,
    Box,
} from '@mui/material'
import Swal from 'sweetalert2';

function Search() {
    const [data, setdata] = useState('')
    const [deliveryData, setdeliveryData] = useState()
    const [orderData, setorderData] = useState()
    const [invalidimei, setinvalidimei] = useState({
        error: 'false',
    })

    const searchIMEI = async (e) => {
        e.preventDefault()
        try {
            const fetchData = async () => {
                const value = data
                setinvalidimei({ error: 'false' })
                await axiosMisUser
                    .post('/imeiDeliverySearch', value)
                    .then((response) => {
                        
                        if (response?.data?.error) {
                            alert('invalid IMEI')
                            setinvalidimei({ error: 'true' })
                        }
                        setdeliveryData(response?.data?.resultdata)
                    })
                await axiosMisUser
                    .post('/imeiOrderSearch', value)
                    .then((response) => {
                        if (response?.data?.error) {
                            setinvalidimei({ error: 'true' })
                            alert('invalid IMEI')
                        }
                        setorderData(response?.data?.resultdata)
                    })
            }
            fetchData()
        } catch (error) {
            alert(error)
        }
    }

    const DeiveryTable = styled(Table)(() => ({
        minWidth: 750,
        width: 9000,
        height: 100,
        whiteSpace: 'pre',
        '& thead': {
            '& th:first-of-type': {
                paddingLeft: 16,
            },
        },
        '& td': {
            borderBottom: 'none',
        },
        '& td:first-of-type': {
            paddingLeft: '16px !important',
        },
    }))

    const OrderTable = styled(Table)(() => ({
        minWidth: 750,
        width: 8000,
        height: 100,
        whiteSpace: 'pre',
        '& thead': {
            '& th:first-of-type': {
                paddingLeft: 16,
            },
        },
        '& td': {
            borderBottom: 'none',
        },
        '& td:first-of-type': {
            paddingLeft: '16px !important',
        },
    }))

    const OrderSearchData = useMemo(() => {
        return (
            <OrderTable>
                <TableHead>
                    <TableRow>
                        <TableCell>Delivery Status</TableCell>
                        <TableCell>Order Imported TimeStamp</TableCell>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Order Date</TableCell>
                        <TableCell>Order TimeStamp</TableCell>
                        <TableCell>Order Status</TableCell>
                        <TableCell>Partner ID</TableCell>
                        <TableCell>Item ID</TableCell>
                        <TableCell>Old Item Details</TableCell>
                        <TableCell>Brand Name</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell>MUIC</TableCell>
                        <TableCell>IMEI</TableCell>
                        <TableCell>Base Disscount</TableCell>
                        <TableCell>Diganostic</TableCell>
                        <TableCell>Partner Purchase Price</TableCell>
                        <TableCell>Tracking ID</TableCell>
                        <TableCell>Delivery Date</TableCell>
                        <TableCell>Order ID Replaced</TableCell>
                        <TableCell>Deliverd With OTP</TableCell>
                        <TableCell>Deliverd With Bag Exception</TableCell>
                        <TableCell>GC Amount Redeemed</TableCell>
                        <TableCell>GC Amount Refund</TableCell>
                        <TableCell>GC Redeem Time</TableCell>
                        <TableCell>GC Amount Refund Time</TableCell>
                        <TableCell>Diagonstic Status</TableCell>
                        <TableCell>VC Eligible</TableCell>
                        <TableCell>
                            Customer Declaration Physical Defect Present
                        </TableCell>
                        <TableCell>
                            Customer Declaration Physical Defect Type
                        </TableCell>
                        <TableCell>Partner Price No Defect</TableCell>
                        <TableCell>Revised Partner Price</TableCell>
                        <TableCell>Delivery Fee</TableCell>
                        <TableCell>Exchange Facilitation Fee</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orderData?.length !== 0 ? (
                        orderData?.map((data, index) => (
                            <TableRow>
                                <TableCell
                                    style={
                                        data?.delivery_status == 'Pending'
                                            ? { color: 'red' }
                                            : { color: 'green' }
                                    }
                                >
                                    {data?.delivery_status}
                                </TableCell>
                                <TableCell>
                                    {new Date(data?.created_at).toLocaleString(
                                        'en-GB',
                                        {
                                            hour12: true,
                                        }
                                    )}
                                </TableCell>
                                <TableCell>
                                    {data?.order_id?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.order_date == null
                                        ? ''
                                        : new Date(
                                              data?.order_date
                                          ).toLocaleString('en-GB', {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                          })}
                                </TableCell>
                                <TableCell>
                                    {data?.order_timestamp == null
                                        ? ''
                                        : new Date(
                                              data?.order_timestamp
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })}
                                </TableCell>
                                <TableCell>
                                    {data?.order_status?.toString()}
                                </TableCell>
                                {/* <TableCell>{data.buyback_category?.toString()}</TableCell> */}
                                <TableCell>
                                    {data?.partner_id?.toString()}
                                </TableCell>
                                {/* <TableCell>{data.partner_email?.toString()}</TableCell> */}
                                {/* <TableCell>{data.partner_shop?.toString()}</TableCell> */}
                                <TableCell>
                                    {data?.item_id?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.old_item_details?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.products?.[0]?.brand_name}
                                </TableCell>
                                <TableCell>
                                    {data?.products?.[0]?.model_name}
                                </TableCell>
                                <TableCell>
                                    {data?.products?.[0]?.muic}
                                </TableCell>
                                <TableCell>{data?.imei?.toString()}</TableCell>
                                <TableCell>
                                    ₹{data?.base_discount?.toString()}
                                </TableCell>
                                <TableCell>{data?.diagnostic}</TableCell>
                                <TableCell>
                                    ₹{data?.partner_purchase_price}
                                </TableCell>
                                <TableCell>{data?.tracking_id}</TableCell>
                                <TableCell>
                                    {data?.delivery_date == null
                                        ? ''
                                        : new Date(
                                              data?.delivery_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })}
                                </TableCell>
                                <TableCell>{data?.order_id_replaced}</TableCell>
                                <TableCell>{data?.deliverd_with_otp}</TableCell>
                                <TableCell>
                                    {data?.deliverd_with_bag_exception}
                                </TableCell>
                                <TableCell>
                                    {data?.gc_amount_redeemed?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.gc_amount_refund?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.gc_redeem_time == null
                                        ? ''
                                        : new Date(
                                              data?.gc_redeem_time
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })}
                                </TableCell>
                                <TableCell>
                                    {data?.gc_amount_refund_time == null
                                        ? ''
                                        : new Date(
                                              data?.gc_amount_refund_time
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })}
                                </TableCell>
                                <TableCell>
                                    {data?.diagnstic_status?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.vc_eligible?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.customer_declaration_physical_defect_present?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.customer_declaration_physical_defect_type?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.partner_price_no_defect?.toString()}
                                </TableCell>
                                <TableCell>
                                    ₹{data?.revised_partner_price?.toString()}
                                </TableCell>
                                <TableCell>
                                    ₹{data?.delivery_fee?.toString()}
                                </TableCell>
                                <TableCell>
                                    ₹
                                    {data?.exchange_facilitation_fee?.toString()}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <tableCell>Order Not Exist.</tableCell>
                        </TableRow>
                    )}
                </TableBody>
            </OrderTable>
        )
    })

    const deliverySearchData = useMemo(() => {
        return (
            <DeiveryTable>
                <TableHead>
                    <TableRow>
                        <TableCell>Delivery Status</TableCell>
                        <TableCell>Delivery Imported Date</TableCell>
                        <TableCell>UIC</TableCell>
                        <TableCell>UIC Status</TableCell>
                        <TableCell>Tracking ID</TableCell>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Order Date</TableCell>
                        <TableCell>Item ID</TableCell>
                        <TableCell>GEP Order</TableCell>
                        <TableCell>IMEI</TableCell>
                        <TableCell>Partner Purchase Price</TableCell>
                        <TableCell>Partner Shop</TableCell>
                        <TableCell>Base Discount</TableCell>
                        <TableCell>Diagnostics Discount</TableCell>
                        <TableCell>Storage Disscount</TableCell>
                        <TableCell>Buyback Category</TableCell>
                        <TableCell>Doorsteps Diagnostics</TableCell>
                        <TableCell>Actual Delivered Date</TableCell>
                        <TableCell>Bag ID</TableCell>
                        <TableCell>Stockin Date</TableCell>
                        <TableCell>Stockin Status</TableCell>
                        <TableCell>Bag close Date</TableCell>
                        <TableCell>BOT Agent Name</TableCell>

                        <TableCell>Assigned to BOT Agent Date</TableCell>
                        <TableCell>Tray ID</TableCell>
                        <TableCell>Tray Type</TableCell>
                        <TableCell>Tray Status</TableCell>
                        <TableCell>Tray Location</TableCell>
                        <TableCell>Tray Closed Time BOT</TableCell>
                        <TableCell>
                            {' '}
                            Tray Received From BOT Time Warehouse
                        </TableCell>
                        <TableCell> Tray Closed Time Warehouse</TableCell>
                        <TableCell>Sorting Agent Name</TableCell>

                        <TableCell>Handover to Sorting Date</TableCell>
                        <TableCell>WHT Tray</TableCell>
                        <TableCell>WHT Tray Assigned Date</TableCell>
                        <TableCell>WHT Tray Received From Sorting</TableCell>
                        <TableCell>WHT Tray Closed After Sorting</TableCell>
                        <TableCell>Charging Username</TableCell>
                        <TableCell>Charging Assigned Date</TableCell>
                        <TableCell>Charge In Date</TableCell>
                        <TableCell>Charge Done Date</TableCell>
                        <TableCell>
                            {' '}
                            Tray Received From Charging Time Warehouse
                        </TableCell>
                        <TableCell>
                            {' '}
                            Charging Done Tray Closed Time Warehouse
                        </TableCell>
                        <TableCell>BQC Agent Name</TableCell>
                        <TableCell>Assigned to BQC</TableCell>
                        <TableCell>BQC Done Date</TableCell>
                        <TableCell>
                            {' '}
                            Tray Received From BQC Time Warehouse
                        </TableCell>
                        <TableCell>
                            {' '}
                            BQC Done Tray Closed Time Warehouse
                        </TableCell>

                        <TableCell>Issued to Audit Date</TableCell>

                        <TableCell>Audit Agnet Name</TableCell>
                        <TableCell>Audit Done Date</TableCell>

                        <TableCell>Audit Done Tray Recieved Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {deliveryData?.length !== 0 ? (
                        deliveryData?.map((data, index) => (
                            <TableRow>
                                <TableCell
                                    style={
                                        data?.result?.length != 0
                                            ? { color: 'green' }
                                            : { color: 'red' }
                                    }
                                >
                                    {data?.result?.length != 0
                                        ? 'Match'
                                        : 'Not Match'}
                                </TableCell>
                                <TableCell>
                                    {new Date(data?.created_at).toLocaleString(
                                        'en-GB',
                                        {
                                            hour12: true,
                                        }
                                    )}
                                </TableCell>
                                <TableCell>{data?.uic_code?.code}</TableCell>
                                <TableCell
                                    style={
                                        data?.uic_status == 'Printed'
                                            ? { color: 'green' }
                                            : data?.uic_status == 'Created'
                                            ? { color: 'orange' }
                                            : { color: 'red' }
                                    }
                                >
                                    {data?.uic_status}
                                </TableCell>
                                <TableCell>
                                    {data?.tracking_id?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.order_id?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.order_date == null
                                        ? ''
                                        : new Date(
                                              data?.order_date
                                          ).toLocaleString('en-GB', {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                          }) == 'Invalid Date'
                                        ? data?.order_date
                                        : new Date(
                                              data?.order_date
                                          ).toLocaleString('en-GB', {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                          })}
                                </TableCell>
                                <TableCell>
                                    {data?.item_id?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.gep_order?.toString()}
                                </TableCell>
                                <TableCell>{data?.imei?.toString()}</TableCell>
                                <TableCell>
                                    {data?.partner_purchase_price?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.partner_shop?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.base_discount?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.diagnostics_discount?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.storage_disscount?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.buyback_category?.toString()}
                                </TableCell>
                                <TableCell>
                                    {data?.doorsteps_diagnostics?.toString()}
                                </TableCell>
                                <TableCell>
                                    {new Date(
                                        data?.delivery_date
                                    ).toLocaleString('en-GB', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </TableCell>

                                {/* <TableCell>{data?.tracking_id}</TableCell>
                <TableCell>{data?.order_id}</TableCell>
                <TableCell
                  style={
                    data?.uic_status ==='printed'
                      ? { color: 'green' }
                      : { color: 'red'  }
                  }
                >
                  { data?.uic_status}
                </TableCell>
                <TableCell>{data?.uic_code?.code}</TableCell>
                <TableCell>{data?.imei}</TableCell>
                <TableCell>{data?.item_id}</TableCell>
                <TableCell>
                  {data?.stockin_date != undefined
                    ? new Date(
                      data?.stockin_date
                    ).toLocaleString('en-GB', {
                      hour12: true,
                    })
                    : ''}
                </TableCell> */}
                                <TableCell>{data?.bag_id}</TableCell>
                                <TableCell>
                                    {data?.stockin_date != undefined
                                        ? new Date(
                                              data?.stockin_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>{data?.stock_in_status}</TableCell>
                                <TableCell>
                                    {data?.bag_close_date != undefined
                                        ? new Date(
                                              data?.bag_close_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>{data?.agent_name}</TableCell>
                                <TableCell>
                                    {data?.assign_to_agent != undefined
                                        ? new Date(
                                              data?.assign_to_agent
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>{data?.tray_id}</TableCell>
                                <TableCell>{data?.tray_type}</TableCell>
                                <TableCell>{data?.tray_status}</TableCell>
                                <TableCell>{data?.tray_location}</TableCell>
                                <TableCell>
                                    {data?.tray_closed_by_bot != undefined
                                        ? new Date(
                                              data?.tray_closed_by_bot
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.bot_done_received != undefined
                                        ? new Date(
                                              data?.bot_done_received
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.tray_close_wh_date != undefined
                                        ? new Date(
                                              data?.tray_close_wh_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.sorting_agent_name}
                                </TableCell>
                                <TableCell>
                                    {data?.handover_sorting_date != undefined
                                        ? new Date(
                                              data?.handover_sorting_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>{data?.wht_tray}</TableCell>
                                <TableCell>
                                    {data?.wht_tray_assigned_date != undefined
                                        ? new Date(
                                              data?.wht_tray_assigned_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.received_from_sorting != undefined
                                        ? new Date(
                                              data?.received_from_sorting
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.closed_from_sorting != undefined
                                        ? new Date(
                                              data?.closed_from_sorting
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.agent_name_charging}
                                </TableCell>
                                <TableCell>
                                    {data?.assign_to_agent_charging != undefined
                                        ? new Date(
                                              data?.assign_to_agent_charging
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.charging_in_date != undefined
                                        ? new Date(
                                              data?.charging_in_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.charging_done_date != undefined
                                        ? new Date(
                                              data?.charging_done_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.charging_done_received != undefined
                                        ? new Date(
                                              data?.charging_done_received
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.charging_done_close != undefined
                                        ? new Date(
                                              data?.charging_done_close
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>{data?.agent_name_bqc}</TableCell>
                                <TableCell>
                                    {data?.assign_to_agent_bqc != undefined
                                        ? new Date(
                                              data?.assign_to_agent_bqc
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.bqc_out_date != undefined
                                        ? new Date(
                                              data?.bqc_out_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.bqc_done_received != undefined
                                        ? new Date(
                                              data?.bqc_done_received
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.bqc_done_close != undefined
                                        ? new Date(
                                              data?.bqc_done_close
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.issued_to_audit != undefined
                                        ? new Date(
                                              data?.issued_to_audit
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>{data?.audit_user_name}</TableCell>
                                <TableCell>
                                    {data?.audit_done_date != undefined
                                        ? new Date(
                                              data?.audit_done_date
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                                <TableCell>
                                    {data?.audit_done_recieved != undefined
                                        ? new Date(
                                              data?.audit_done_recieved
                                          ).toLocaleString('en-GB', {
                                              hour12: true,
                                          })
                                        : ''}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            {invalidimei?.error === 'false' ? (
                                <TableCell>Delivery Not Exist.</TableCell>
                            ) : (
                                ''
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </DeiveryTable>
        )
    })
    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'IMEI Search', path: '/' },
                        { name: 'Search' },
                    ]}
                />
            </div>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                }}
            >
                <Box>
                    <TextField
                        label="Search IMEI"
                        variant="outlined"
                        onChange={(e) => {
                            setdata(() => ({ ...data, value: e.target.value }))
                        }}
                        sx={{ mb: 3, mt: 3 }}
                    />
                </Box>
                <Box>
                    <Button
                        sx={{ mb: 2, mt: 4, ml: 3 }}
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                            searchIMEI(e)
                        }}
                    >
                        Search
                    </Button>
                </Box>
            </Box>

            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle">
                Orders
            </Typography>
            <Card sx={{ maxHeight: '100%', overflow: 'auto' }} elevation={6}>
                {OrderSearchData}
            </Card>

            <Typography
                sx={{ flex: '1 1 100%', mt: 4 }}
                variant="h6"
                id="tableTitle"
            >
                Delivery
            </Typography>
            <Card
                sx={{ maxHeight: '100%', overflow: 'auto', mb: 4 }}
                elevation={6}
            >
                {deliverySearchData}
            </Card>
        </Container>
    )
}

export default Search
