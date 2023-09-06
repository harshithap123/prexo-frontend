import MUIDataTable from 'mui-datatables'
import { Breadcrumb } from 'app/components'
import React, { useState, useEffect, useMemo } from 'react'
import { styled } from '@mui/system'
import {
    Button,
    Box,
    Checkbox,
    Typography,
    Table,
    TableContainer,
    Card,
} from '@mui/material'

import { axiosMisUser, axiosWarehouseIn } from '../../../../../axios'
import jwt_decode from 'jwt-decode'
import useAuth from 'app/hooks/useAuth'
import { useNavigate, useParams } from 'react-router-dom'
import AssignDialogBox from './assign-dialog'
import Swal from 'sweetalert2'

const Container = styled('div')(({ theme }) => ({
    margin: '30px',
    [theme.breakpoints.down('sm')]: {
        margin: '16px',
    },
    '& .breadcrumb': {
        marginBottom: '30px',
        [theme.breakpoints.down('sm')]: {
            marginBottom: '16px',
        },
    },
}))

const StyledTable = styled(Table)(({ theme }) => ({
    whiteSpace: 'pre',
    '& thead': {
        '& tr': { '& th': { paddingLeft: 0, paddingRight: 0 } },
    },
    '& tbody': {
        '& tr': { '& td': { paddingLeft: 0, textTransform: 'capitalize' } },
    },
}))

const ProductTable = styled(Table)(() => ({
    minWidth: 750,
    width: '100%',
    height: '100%',
    whiteSpace: 'nowrap',
    '& thead': {
        '& th:first-of-type': {
            paddingLeft: 16,
        },
    },
    '& td': {
        borderBottom: '1px solid #ddd',
    },
    '& td:first-of-type': {
        paddingLeft: '16px !important',
    },
}))
const ProductTable1 = styled(Table)(() => ({
    minWidth: 750,
    width: '100%',
    height: '100%',
    whiteSpace: 'nowrap',
    '& thead': {
        '& th:first-of-type': {
            paddingLeft: 16,
        },
    },
    '& td': {
        borderBottom: '1px solid #ddd',
    },
    '& td:first-of-type': {
        paddingLeft: '16px !important',
    },
}))

const ScrollableTableContainer = styled(TableContainer)`
    overflow-x: scroll;

    /* Hide the scrollbar in webkit-based browsers */
    ::-webkit-scrollbar {
        display: none;
    }
`

const SimpleMuiTable = () => {
    const [isAlive, setIsAlive] = useState(true)
    const [isCheck, setIsCheck] = useState([])
    const navigate = useNavigate()
    const [selectedQtySp, setSelectedQtySp] = useState(0)
    const { brand, model } = useParams()
    const { logout, user } = useAuth()
    const [requrementList, setRequrementList] = useState({
        spTray: [],
        rpTray: [],
        spWUser: [],
        sortingAgent: [],
    })
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUic, setSelectedUic] = useState([])
    const [unitsData, setUnitsData] = useState([])
    const [checkBoxDis, setCheckBoxDis] = useState(false)
    const [location, setLoaction] = useState('')
    const [shouldOpenEditorDialog, setShouldOpenEditorDialog] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                let admin = localStorage.getItem('prexo-authentication')
                if (admin) {
                    const { location } = jwt_decode(admin)
                    setLoaction(location)
                    setIsLoading(true)
                    let obj = {
                        brand: brand,
                        model: model,
                        location: location,
                    }
                    const res = await axiosMisUser.post(
                        '/whToRpAssignForRepair',
                        obj
                    )
                    if (res.status == 200) {
                        setIsLoading(false)
                        setUnitsData(res.data.data)
                    }
                }
            } catch (error) {
                alert(error)
            }
        }
        fetchData()
    }, [isAlive])

    const handleClick = async (e, partData, uic) => {
        try {
            setCheckBoxDis(true)
            const { id, checked } = e.target
            let obj = {
                isCheck: isCheck,
                partList: partData,
                checked: checked,
                selectedQtySp: selectedQtySp,
                uic: uic,
            }
            if (!checked) {
                setSelectedUic(selectedUic.filter((item) => item !== uic))
            }
            const res = await axiosMisUser.post(
                '/assignForRepiar/stockCheck',
                obj
            )
            if (res.status == 200) {
                setCheckBoxDis(false)
                setIsCheck(res.data.data)
                setSelectedQtySp(res.data.countofStock)
                if (checked) {
                    setSelectedUic([...selectedUic, uic])
                }
            } else {
                setCheckBoxDis(false)
                Swal.fire({
                    position: 'top-center',
                    icon: 'error',
                    title: res.data.message,
                    confirmButtonText: 'Ok',
                })
            }
        } catch (error) {
            alert(error)
        }
    }

    const handleDialogClose = () => {
        setIsCheck([])
        setRequrementList({
            spTray: [],
            rpTray: [],
            spWUser: [],
            sortingAgent: [],
        })
        setSelectedUic([])
        setSelectedQtySp(0)
        setShouldOpenEditorDialog(false)
    }

    const handleDialogOpen = async () => {
        try {
            let obj = {
                location: location,
                brand: brand,
                model: model,
                uicLength: selectedUic.length,
                isCheck: isCheck.length,
                selectedQtySp: selectedQtySp,
            }
            const res = await axiosMisUser.post(
                '/assignForRepiar/getTheRequrements',
                obj
            )
            if (res.status == 200) {
                setRequrementList({
                    spTray: res.data.getSpTray,
                    rpTray: res.data.getRpTray,
                    spWUser: res.data.spWhUser,
                    sortingAgent: res.data.getSortingAgent,
                })
                setShouldOpenEditorDialog(true)
            }
        } catch (error) {
            alert('Server not responding please wait...')
        }
    }

    const columns = [
        {
            name: 'items',
            label: (
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ marginLeft: '7px' }}
                >
                    <>Select</>
                </Typography>
            ),
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value, tableMeta) => {
                    return (
                        <Checkbox
                            disabled={checkBoxDis}
                            onClick={(e) => {
                                handleClick(
                                    e,
                                    tableMeta.rowData[7]?.rdl_fls_report
                                        ?.partRequired,
                                    value?.uic
                                )
                            }}
                            id={value?.uic}
                            key={value?.uic}
                            checked={isCheck.some((obj) =>
                                obj?.uic?.includes(value?.uic)
                            )}
                        />
                    )
                },
            },
        },
        {
            name: 'index',
            label: (
                <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    noWrap
                    sx={{ mr: 8 }}
                >
                    <>Record No</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography sx={{ pl: 4 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },

        {
            name: 'items',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>UIC</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) => value?.uic || '',
            },
        },
        {
            name: 'code',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Tray ID</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'closed_date_agent',
            label: (
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    <>RDL 1 Done Date</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value) =>
                    new Date(value).toLocaleString('en-GB', {
                        hour12: true,
                    }),
            },
        },
        {
            name: 'items',
            label: (
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    <>RDL 1 Username</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.rdl_fls_report?.username || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    <>RDL 1 User Remarks</>
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, dataIndex) =>
                    value?.rdl_fls_report?.description || '',
            },
        },
        {
            name: 'items',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Repair item</>
                </Typography>
            ),
            options: {
                filter: true,
                filterType: 'textField',
                sort: true, // enable sorting for Brand column
                customBodyRender: (value, tableMeta) => {
                    const dataIndex = tableMeta.rowIndex
                    const partRequired = value?.rdl_fls_report?.partRequired

                    if (partRequired && partRequired.length > 0) {
                        const partsList = partRequired.map((data, index) => {
                            return `${index + 1}.${data?.part_name} - ${
                                data?.part_id
                            }`
                        })

                        return partsList.join(', ')
                    }

                    return ''
                },
            },
        },
    ]

    const columns2 = [
        {
            name: 'index',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Record No</>
                </Typography>
            ),
            options: {
                filter: false,
                sort: false,
                customBodyRender: (rowIndex, dataIndex) => (
                    <Typography sx={{ pl: 4 }}>
                        {dataIndex.rowIndex + 1}
                    </Typography>
                ),
            },
        },

        {
            name: 'partId',
            label: (
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                    <>Spare Part Number</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'partName',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Spare Part Name</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'uic',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    UIC's Selected
                </Typography>
            ),
            options: {
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    return value?.join(',')
                },
            },
        },
        {
            name: 'avl_stock',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Available Quantity</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'selected_qty',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Selected Quantity</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
        {
            name: 'balance_stock',
            label: (
                <Typography variant="subtitle1" fontWeight="bold">
                    <>Balance Quantity</>
                </Typography>
            ),
            options: {
                filter: true,
            },
        },
    ]

    // TOP TABLE
    const UicListTable = useMemo(() => {
        return (
            <StyledTable
                sx={{
                    borderRadius: '20px',
                    margin: 'auto',
                }}
            >
                <ScrollableTableContainer>
                    <ProductTable>
                        <MUIDataTable
                            // title={'Assign for Repairs'}
                            sx={{ borderTop: '0px' }}
                            data={unitsData}
                            columns={columns}
                            options={{
                                filterType: 'textField',
                                responsive: 'simple',
                                download: false,
                                print: false,
                                textLabels: {
                                    body: {
                                        noMatch: isLoading
                                            ? 'Loading...'
                                            : 'Sorry, there is no matching data to display',
                                    },
                                },
                                selectableRows: 'none', // set checkbox for each row
                                // search: false, // set search option
                                // filter: false, // set data filter option
                                // download: false, // set download option
                                // print: false, // set print option
                                //  pagination: false, //set pagination option
                                // viewColumns: false, // set column option
                                customSort: (data, colIndex, order) => {
                                    return data.sort((a, b) => {
                                        if (colIndex === 1) {
                                            return (
                                                (a.data[colIndex].price <
                                                b.data[colIndex].price
                                                    ? -1
                                                    : 1) *
                                                (order === 'desc' ? 1 : -1)
                                            )
                                        }
                                        return (
                                            (a.data[colIndex] < b.data[colIndex]
                                                ? -1
                                                : 1) *
                                            (order === 'desc' ? 1 : -1)
                                        )
                                    })
                                },
                                // elevation: 0,
                                // rowsPerPageOptions: [10, 20, 40, 80, 100],
                            }}
                        />
                    </ProductTable>
                </ScrollableTableContainer>
            </StyledTable>
        )
    }, [unitsData, columns])

    // SELECTED UIC TABLE BOTTOM
    const selectedUicTable = useMemo(() => {
        return (
            <ProductTable1>
                <MUIDataTable
                    // title={'Assign for Repairs'}
                    data={isCheck}
                    columns={columns2}
                    options={{
                        filterType: 'textField',
                        responsive: 'simple',
                        download: false,
                        print: false,
                        textLabels: {
                            body: {
                                noMatch: isLoading
                                    ? 'Loading...'
                                    : 'Sorry, there is no matching data to display',
                            },
                        },
                        selectableRows: 'none', // set checkbox for each row
                        // search: false, // set search option
                        // filter: false, // set data filter option
                        // download: false, // set download option
                        // print: false, // set print option
                        // pagination: true, //set pagination option
                        // viewColumns: false, // set column option
                        customSort: (data, colIndex, order) => {
                            return data.sort((a, b) => {
                                if (colIndex === 1) {
                                    return (
                                        (a.data[colIndex].price <
                                        b.data[colIndex].price
                                            ? -1
                                            : 1) * (order === 'desc' ? 1 : -1)
                                    )
                                }
                                return (
                                    (a.data[colIndex] < b.data[colIndex]
                                        ? -1
                                        : 1) * (order === 'desc' ? 1 : -1)
                                )
                            })
                        },
                        elevation: 0,
                        // rowsPerPageOptions: [10, 20, 40, 80, 100],
                    }}
                />
                <Box sx={{ textAlign: 'right', mr: 4 }}>
                    <Button
                        sx={{
                            m: 1,
                        }}
                        variant="contained"
                        disabled={isCheck?.length == 0}
                        onClick={() => handleDialogOpen()}
                        style={{ backgroundColor: 'green' }}
                        component="span"
                    >
                        Send to Repair
                    </Button>
                </Box>
            </ProductTable1>
        )
    }, [isCheck, columns2])

    return (
        <Container>
            <div className="breadcrumb">
                <Breadcrumb
                    routeSegments={[
                        { name: 'Sorting', path: '/' },
                        { name: 'Wht to rp' },
                    ]}
                />
            </div>

            <Card sx={{}}>
                <Box>
                    <Box sx={{ pt: 2, pl: 2 }}>
                        <Typography
                            sx={{ fontSize: 'large', fontWeight: 'bold' }}
                        >
                            Assign for Repairs
                        </Typography>
                        <Typography sx={{ mt: 2 }}>Brand : {brand}</Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography sx={{ ml: 2 }}>Model : {model}</Typography>
                        <Box>
                            <Typography sx={{ mr: 4 }}>
                                Selected UIC's : {selectedUic?.length}
                            </Typography>
                            <Typography sx={{ mr: 4 }}>
                                Total : {unitsData?.length}
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            border: '',
                            width: '100%',
                            marginLeft: '',
                            marginRight: '',
                            borderRadius: '8px',
                            background: 'white',
                        }}
                        overflow="auto"
                    >
                        {UicListTable}
                    </Box>
                </Box>
            </Card>
            <br />
            <br />
            <Card>
                <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontSize: 'large', fontWeight: 'bold' }}>
                        Spare Part Availability & Selection
                    </Typography>
                </Box>

                <ScrollableTableContainer>
                    {selectedUicTable}
                </ScrollableTableContainer>
            </Card>
            {shouldOpenEditorDialog && (
                <AssignDialogBox
                    handleClose={handleDialogClose}
                    open={handleDialogOpen}
                    setIsAlive={setIsAlive}
                    requrementList={requrementList}
                    selectedUic={selectedUic}
                    isCheck={isCheck}
                />
            )}
        </Container>
    )
}

export default SimpleMuiTable
