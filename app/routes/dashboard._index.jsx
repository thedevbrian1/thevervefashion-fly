export default function DashboardIndex() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 lg:mt-12">
            <div className="border border-slate-200 p-6 text-center rounded">
                <p className="text-3xl font-semibold">Ksh 10000</p>
                <p className="uppercase text-sm mt-2 text-gray-500">Total amount earned</p>
            </div>
            <div className="border border-slate-200 p-6 text-center rounded">
                <p className="text-3xl font-semibold">30</p>
                <p className="uppercase text-sm mt-2 text-gray-500">Total items sold</p>
            </div>
            <div className="border border-slate-200 p-6 text-center rounded">
                <p className="text-3xl font-semibold">Ksh 10000</p>
                <p className="uppercase text-sm mt-2 text-gray-500">Total profit</p>
            </div>
            <div className="border border-slate-200 p-6 text-center rounded">
                <p className="text-3xl font-semibold">Ksh 10000</p>
                <p className="uppercase text-sm mt-2 text-gray-500">Total amount</p>
            </div>
            {/* <div>
                <p>30</p>
                <p>Total items sold</p>
            </div> */}

        </div>
    );
}