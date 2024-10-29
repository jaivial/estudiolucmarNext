import cors, { runMiddleware } from '../../utils/cors';
import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { startOfDay, subDays, startOfWeek, subWeeks, startOfMonth, subMonths, startOfYear, subYears, startOfToday } from 'date-fns';

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);

    if (req.method === 'GET') {
        const { userId, user_id } = req.query;

        console.log('req.query', req.query);

        if (!user_id) {
            return res.status(400).json({ message: 'user_id is required' });
        }

        try {
            const client = await clientPromise;
            const db = client.db('inmoprocrm');

            // Convert user_id to ObjectId for matching in ventas collection
            const userObjectId = new ObjectId(userId);

            // Fetch all transactions for the user from ventas collection
            const transactions = await db.collection('ventas').find({
                "user_id": userObjectId
            }).toArray();

            // Helper function to calculate sums for a specific period
            const calculatePeriodSums = (transactions, startDate, endDate) => {
                const filteredTransactions = transactions.filter(trans => new Date(trans.fechaFinalizacion) >= startDate && new Date(trans.fechaFinalizacion) < endDate);
                const ventasSum = filteredTransactions.filter(trans => trans.tipoEncargo === 'Venta').reduce((acc, curr) => acc + curr.precio, 0);
                const alquilerSum = filteredTransactions.filter(trans => trans.tipoEncargo === 'Alquiler').reduce((acc, curr) => acc + curr.precio, 0);
                const comisionTotal = filteredTransactions.reduce((acc, curr) => acc + curr.comisionTotal, 0);
                return { ventasSum, alquilerSum, comisionTotal };
            };

            // Generate period data for the last 14 days, 8 weeks, 8 months, 8 6-month periods, and 8 years
            const generatePeriodData = (transactions, periodFn, numPeriods, unit) => {
                const data = [];
                let currentEnd = startOfToday();

                for (let i = 0; i < numPeriods; i++) {
                    const currentStart = periodFn(currentEnd, i);
                    data.push(calculatePeriodSums(transactions, currentStart, currentEnd));
                    currentEnd = currentStart;
                }

                return data.reverse(); // Latest period last for easier reading
            };

            // Custom functions to set start dates for each period type
            const startOfLastDay = (end, i) => startOfDay(subDays(end, i));
            const startOfLastWeek = (end, i) => startOfWeek(subWeeks(end, i));
            const startOfLastMonth = (end, i) => startOfMonth(subMonths(end, i));
            const startOfLast6Months = (end, i) => startOfMonth(subMonths(end, 6 * i));
            const startOfLastYear = (end, i) => startOfYear(subYears(end, i));

            const analyticsResults = {
                last14Days: generatePeriodData(transactions, startOfLastDay, 14, 'day'),
                last8Weeks: generatePeriodData(transactions, startOfLastWeek, 8, 'week'),
                last8Months: generatePeriodData(transactions, startOfLastMonth, 8, 'month'),
                last8_6Months: generatePeriodData(transactions, startOfLast6Months, 8, '6-month'),
                last8Years: generatePeriodData(transactions, startOfLastYear, 8, 'year')
            };

            // Summary of each period's total sums for current and previous periods
            const summaryPeriods = {
                currentWeek: { start: startOfWeek(new Date()), end: startOfToday() },
                previousWeek: { start: startOfWeek(subWeeks(new Date(), 1)), end: startOfWeek(new Date()) },
                currentMonth: { start: startOfMonth(new Date()), end: startOfToday() },
                previousMonth: { start: startOfMonth(subMonths(new Date(), 1)), end: startOfMonth(new Date()) },
                current6Months: { start: startOfMonth(subMonths(new Date(), 6)), end: startOfToday() },
                previous6Months: { start: startOfMonth(subMonths(new Date(), 12)), end: startOfMonth(subMonths(new Date(), 6)) },
                currentYear: { start: startOfYear(new Date()), end: startOfToday() },
                previousYear: { start: startOfYear(subYears(new Date(), 1)), end: startOfYear(new Date()) }
            };

            for (const [periodName, { start, end }] of Object.entries(summaryPeriods)) {
                analyticsResults[periodName] = calculatePeriodSums(transactions, start, end);
            }

            // Calculate performance for each period
            const calculatePerformance = (current, previous) => {
                return previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
            };

            const performance = {
                week: {
                    ventasPerformance: calculatePerformance(analyticsResults.currentWeek.ventasSum, analyticsResults.previousWeek.ventasSum),
                    alquilerPerformance: calculatePerformance(analyticsResults.currentWeek.alquilerSum, analyticsResults.previousWeek.alquilerSum),
                    comisionPerformance: calculatePerformance(analyticsResults.currentWeek.comisionTotal, analyticsResults.previousWeek.comisionTotal),
                },
                month: {
                    ventasPerformance: calculatePerformance(analyticsResults.currentMonth.ventasSum, analyticsResults.previousMonth.ventasSum),
                    alquilerPerformance: calculatePerformance(analyticsResults.currentMonth.alquilerSum, analyticsResults.previousMonth.alquilerSum),
                    comisionPerformance: calculatePerformance(analyticsResults.currentMonth.comisionTotal, analyticsResults.previousMonth.comisionTotal),
                },
                sixMonths: {
                    ventasPerformance: calculatePerformance(analyticsResults.current6Months.ventasSum, analyticsResults.previous6Months.ventasSum),
                    alquilerPerformance: calculatePerformance(analyticsResults.current6Months.alquilerSum, analyticsResults.previous6Months.alquilerSum),
                    comisionPerformance: calculatePerformance(analyticsResults.current6Months.comisionTotal, analyticsResults.previous6Months.comisionTotal),
                },
                year: {
                    ventasPerformance: calculatePerformance(analyticsResults.currentYear.ventasSum, analyticsResults.previousYear.ventasSum),
                    alquilerPerformance: calculatePerformance(analyticsResults.currentYear.alquilerSum, analyticsResults.previousYear.alquilerSum),
                    comisionPerformance: calculatePerformance(analyticsResults.currentYear.comisionTotal, analyticsResults.previousYear.comisionTotal),
                }
            };

            // Calculate futureEncargoComisiones
            const encargos = await db.collection('encargos').find({
                "comercial_encargo.value": user_id
            }).toArray();

            const calculateCommission = (encargo) => {
                const precio = encargo.precio_2 || encargo.precio_1;
                let comisionPedido = 0;
                let comisionComprador = 0;

                // Calculate comisionPedido
                if (encargo.tipo_comision_encargo === 'Fijo') {
                    comisionPedido = encargo.comision_encargo;
                } else if (encargo.tipo_comision_encargo === 'Porcentaje') {
                    comisionPedido = (encargo.comision_encargo / 100) * precio;
                }

                // Calculate comisionComprador
                if (encargo.comisionComprador === 'Fijo') {
                    comisionComprador = encargo.comisionCompradorValue;
                } else if (encargo.comisionComprador === 'Porcentaje') {
                    comisionComprador = (encargo.comisionCompradorValue / 100) * precio;
                }

                return comisionPedido + comisionComprador;
            };

            const futureEncargoComisiones = encargos.reduce((total, encargo) => total + calculateCommission(encargo), 0);

            console.log('performance', performance);
            console.log('analyticsResults', analyticsResults);
            console.log('futureEncargoComisiones', futureEncargoComisiones);

            res.status(200).json({ analyticsResults, performance, futureEncargoComisiones });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            res.status(500).json({ message: 'Error fetching analytics', error: error.message });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
