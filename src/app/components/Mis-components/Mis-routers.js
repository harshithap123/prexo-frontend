import React, { lazy } from 'react'
import Loadable from 'app/components/Loadable/Loadable'

const Dashboard = Loadable(lazy(() => import('./Dashboard/dashboard')))
const Orders = Loadable(lazy(() => import('./Order/order')))
const BulkImportOrder = Loadable(
    lazy(() => import('./Order/bulk-import-order'))
)
const BadOrders = Loadable(lazy(() => import('./Order/view-bad-order')))
const Delivery = Loadable(lazy(() => import('./Delivery/delivery')))
const BulkImportDelivery = Loadable(
    lazy(() => import('./Delivery/bulk-import-delivery'))
)
const BadDelivery = Loadable(lazy(() => import('./Delivery/badDelivery')))
const ReconDeliveredOrders = Loadable(
    lazy(() => import('./Recon-sheet/delivered-orders'))
)
const ReconNotDeliveredOrders = Loadable(
    lazy(() => import('./Recon-sheet/not-delivered-orders'))
)
const AssignToBot = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-bot/view-bot-tray'))
)
const AssignToBotUicGen = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-bot/uic-gen'))
)
const AssignToBqc = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-bqc/bqcplanner'))
)
const AssignToAudit = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-audit/view-wht-tray'))
)
const AssignToCharging = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-charging/chargingplanner'))
)
const FromChargingplanner = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-charging/view-wht-tray'))
)
const Frombqcplanner = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-bqc/view-wht-tray'))
)
const AssignToRdl = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-rdl-fls/wht-tray'))
)
const AssignToRdltrayView = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-rdl-fls/view-wht-tray'))
)
const AssignToRdltwo = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-rdl-repair/tray'))
)
const AssignToRdltwoview = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-rdl-repair/view-wht-tray'))
)
const UicAll = Loadable(lazy(() => import('./Uic-manage/all')))
const UicDownloaded = Loadable(
    lazy(() => import('./Uic-manage/uic-downloaded'))
)
const UicGenerated = Loadable(lazy(() => import('./Uic-manage/uic-generated')))
const UicNotGenerated = Loadable(
    lazy(() => import('./Uic-manage/uic-not-generated'))
)
const SortingBotTowht = Loadable(
    lazy(() => import('./Sorting/Bot-to-wht/bot-tray'))
)
const SortingWhtTorp = Loadable(
    lazy(() => import('./Sorting/Wht-to-rp/wht-tray'))
)
const Process = Loadable(lazy(() => import('./Sorting/Wht-to-rp/process')))
const SortingBotTowhtViewItem = Loadable(
    lazy(() => import('./Sorting/Bot-to-wht/view-clubed-item'))
)
const SortingBotTowhtAssignSectionToAgent = Loadable(
    lazy(() => import('./Sorting/Bot-to-wht/assign-for-sorting'))
)
const SortingBotTowhtAssign = Loadable(
    lazy(() => import('./Sorting/Bot-to-wht/wht-assignment'))
)
const MergeMmt = Loadable(lazy(() => import('./Merge/Mmt-merge/mmt-tray')))
const MergeMmtViewItem = Loadable(
    lazy(() => import('./Merge/Mmt-merge/view-item'))
)
const MergeWht = Loadable(lazy(() => import('./Merge/Wht-merge/wht-tray')))
const TrackItem = Loadable(lazy(() => import('./Track/item-track')))
const SearchImei = Loadable(lazy(() => import('./Wht-utility/search')))
const Pickup = Loadable(lazy(() => import('./Merge/Pickup/pickup')))
const WhtutilityBotTray = Loadable(lazy(() => import('./Wht-utility/bot-tray')))
const WhtUtilityBotTrayResticker = Loadable(
    lazy(() => import('./Wht-utility/bot-tray-resticker'))
)
const WhtUtilityBotTrayClose = Loadable(
    lazy(() => import('./Wht-utility/bot-tray-close'))
)
const CtxMerge = Loadable(lazy(() => import('./Merge/Ctx-merge/ctx-tray')))
const CtxTrayTransfer = Loadable(
    lazy(() => import('./ctx-tray/Transfer/ctx-tray'))
)
const CtxTrayReceiveFromProcessing = Loadable(
    lazy(() => import('./ctx-tray/Receive/request'))
)
const CtxToStxAssignToSorting = Loadable(
    lazy(() => import('./Sorting/Ctx-to-stx/ctx-tray'))
)
const StxMerging = Loadable(lazy(() => import('./Merge/Stx-merging/tray')))
const BilledBin = Loadable(lazy(() => import('./BilledBin/items')))
const BilledBinReport = Loadable(lazy(() => import('./Report/billed-bin')))
const ViewRpTray = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-rdl-repair/view-rp'))
)
const ViewSpTray = Loadable(
    lazy(() => import('./Assign-to-agent/Assign-to-rdl-repair/view-sp'))
)

const dataTableRoutes = [
    {
        path: '/mis/assign-to-agent/rdl-two/view-rp/:trayId',
        element: <ViewRpTray />,
    },
    {
        path: '/mis/assign-to-agent/rdl-two/view-sp/:trayId',
        element: <ViewSpTray />,
    },
    {
        path: '/mis/dashboard',
        element: <Dashboard />,
    },

    {
        path: '/mis/orders',
        element: <Orders />,
    },
    {
        path: '/mis/uic-manage/all',
        element: <UicAll />,
    },
    {
        path: '/mis/bad-orders',
        element: <BadOrders />,
    },
    {
        path: '/mis/delivery',
        element: <Delivery />,
    },
    {
        path: '/mis/bad-delivery',
        element: <BadDelivery />,
    },
    {
        path: '/mis/recon-sheet/delivered-orders',
        element: <ReconDeliveredOrders />,
    },
    {
        path: '/mis/recon-sheet/not-delivered-orders',
        element: <ReconNotDeliveredOrders />,
    },
    {
        path: '/mis/uic-manage/uic-downloaded',
        element: <UicDownloaded />,
    },
    {
        path: '/mis/uic-manage/uic-generated',
        element: <UicGenerated />,
    },
    {
        path: '/mis/uic-manage/uic-not-generated',
        element: <UicNotGenerated />,
    },
    {
        path: '/mis/assign-to-agent/bot',
        element: <AssignToBot />,
    },
    {
        path: '/mis/assign-to-agent/bot/uic-genaration/:bagId',
        element: <AssignToBotUicGen />,
    },
    {
        path: '/mis/assign-to-agent/bqc',
        element: <Frombqcplanner />,
    },
    {
        path: '/mis/assign-to-agent/bqcplanner/view-wht-tray/:brand/:model/:jack',
        element: <Frombqcplanner />,
    },
    {
        path: '/mis/assign-to-agent/charging',
        element: <FromChargingplanner />,
    },
    {
        path: '/mis/assign-to-agent/chargingplanner/view-wht-tray/:brand/:model/:jack',
        element: <FromChargingplanner />,
    },
    {
        path: '/mis/assign-to-agent/audit',
        element: <AssignToAudit />,
    },
    {
        path: '/mis/assign-to-agent/rdl-fls',
        element: <AssignToRdl />,
    },
    {
        path: '/mis/assign-to-agent/rdl-fls/view-item/:trayId',
        element: <AssignToRdltrayView />,
    },
    {
        path: '/mis/assign-to-agent/rdl-two',
        element: <AssignToRdltwo />,
    },
    {
        path: '/mis/assign-to-agent/rdl-two/view-item/:trayId',
        element: <AssignToRdltwoview />,
    },
    {
        path: '/mis/sorting/bot-to-wht',
        element: <SortingBotTowht />,
    },
    {
        path: '/mis/sorting/wht-to-rp',
        element: <SortingWhtTorp />,
    },
    {
        path: '/mis/sorting/wht-to-rp/process/:brand/:model',
        element: <Process />,
    },
    {
        path: '/mis/sorting/ctx-to-stx',
        element: <CtxToStxAssignToSorting />,
    },
    {
        path: '/mis/sorting/bot-to-wht/assign-for-sorting',
        element: <SortingBotTowhtAssignSectionToAgent />,
    },
    {
        path: '/mis/sorting/bot-to-wht/assign-for-sorting/view-item',
        element: <SortingBotTowhtViewItem />,
    },
    {
        path: '/mis/sorting/bot-to-wht/wht-assignment',
        element: <SortingBotTowhtAssign />,
    },
    {
        path: '/mis/merge/mmt',
        element: <MergeMmt />,
    },
    {
        path: '/mis/merge/pickup',
        element: <Pickup />,
    },
    {
        path: '/mis/merge/mmt/view-item/:trayId',
        element: <MergeMmtViewItem />,
    },
    {
        path: '/mis/merge/wht',
        element: <MergeWht />,
    },
    {
        path: '/mis/merge/ctx',
        element: <CtxMerge />,
    },
    {
        path: '/mis/merge/stx',
        element: <StxMerging />,
    },
    {
        path: '/mis/orders/bulk-import',
        element: <BulkImportOrder />,
    },
    {
        path: '/mis/delivery/bulk-import',
        element: <BulkImportDelivery />,
    },
    {
        path: '/mis/track/item',
        element: <TrackItem />,
    },
    {
        path: '/mis/ctx/transfer',
        element: <CtxTrayTransfer />,
    },
    {
        path: '/mis/ctx/receive',
        element: <CtxTrayReceiveFromProcessing />,
    },
    {
        path: '/warehouse/wht-utility/import-data',
        element: <SearchImei />,
    },
    {
        path: '/warehouse/wht-utility/Bot-tray',
        element: <WhtutilityBotTray />,
    },
    {
        path: '/warehouse/wht-utility/Bot-tray/resticker/:trayId',
        element: <WhtUtilityBotTrayResticker />,
    },
    {
        path: '/warehouse/wht-utility/Bot-tray/close/:trayId',
        element: <WhtUtilityBotTrayClose />,
    },
    {
        path: '/mis/billedbin',
        element: <BilledBin />,
    },
    {
        path: '/mis/report/billedBin',
        element: <BilledBinReport />,
    },
]

export default dataTableRoutes
