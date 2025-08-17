
// FILE: client/src/admin/DashboardGraph.jsx

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDocs, collection, Timestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import PermissionGuard from './components/PermissionGuard';

const AdminGraph = () => {
  const [applicantTrendData, setApplicantTrendData] = useState([]);
  const [messageTrendData, setMessageTrendData] = useState([]);
  const [userStatusTrendData, setUserStatusTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const applicantsSnapshot = await getDocs(collection(db, 'applications'));
        const messagesSnapshot = await getDocs(collection(db, 'Get_A_Quote'));

        const processMonthlyData = (snapshot, dateField) => {
          const countsByMonth = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            const dateValue = data[dateField];
            if (dateValue) {
              const date = dateValue instanceof Timestamp
                ? dateValue.toDate()
                : new Date(dateValue);
              
              if (isNaN(date.getTime())) {
                console.warn(`Invalid ${dateField} date for doc ${doc.id}:`, dateValue);
                return;
              }
              const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              if (!countsByMonth[monthYear]) {
                countsByMonth[monthYear] = 0;
              }
              countsByMonth[monthYear]++;
            }
          });
          return countsByMonth;
        };
        
        const applicantsByMonthRaw = processMonthlyData(applicantsSnapshot, 'submittedAt');
        const messagesByMonthRaw = processMonthlyData(messagesSnapshot, 'createdAt');

        const usersList = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : null,
        }));

        const today = new Date();
        const last6MonthsKeys = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          last6MonthsKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
        
        const formattedApplicantData = last6MonthsKeys.map(monthYear => {
          const [year, monthNum] = monthYear.split('-');
          const monthName = new Date(parseInt(year), parseInt(monthNum, 10) - 1, 1).toLocaleString('default', { month: 'short' });
          return {
            name: `${monthName} '${year.substring(2)}`,
            applicants: applicantsByMonthRaw[monthYear] || 0,
          };
        });

        const formattedMessageData = last6MonthsKeys.map(monthYear => {
          const [year, monthNum] = monthYear.split('-');
          const monthName = new Date(parseInt(year), parseInt(monthNum, 10) - 1, 1).toLocaleString('default', { month: 'short' });
          return {
            name: `${monthName} '${year.substring(2)}`,
            messages: messagesByMonthRaw[monthYear] || 0,
          };
        });
        
        const formattedUserStatusData = last6MonthsKeys.map(monthYear => {
            const [year, monthNumStr] = monthYear.split('-');
            const monthNum = parseInt(monthNumStr, 10);
            const endOfMonth = new Date(parseInt(year), monthNum, 0, 23, 59, 59);

            let totalUsers = 0;
            let activeUsers = 0;
            let inactiveUsers = 0;

            usersList.forEach(user => {
                if (user.createdAt && user.createdAt <= endOfMonth) {
                    totalUsers++;
                    if (user.isActive) {
                        activeUsers++;
                    } else {
                        inactiveUsers++;
                    }
                }
            });
            const monthName = new Date(parseInt(year), monthNum - 1, 1).toLocaleString('default', { month: 'short' });
            return {
                name: `${monthName} '${year.substring(2)}`,
                totalUsers,
                activeUsers,
                inactiveUsers,
            };
        });

        setApplicantTrendData(formattedApplicantData);
        setMessageTrendData(formattedMessageData);
        setUserStatusTrendData(formattedUserStatusData);
        
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-80 text-gray-300">Loading charts...</div>;
  }

  return (
    <div className="w-full my-5 p-4 md:p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
      <h2 className="text-xl font-semibold text-yellow-500 mb-6">Dashboard Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <PermissionGuard permission="dashboard_view_message_analytics">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Message Analytics (Last 6 Months)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={messageTrendData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#4a5568"/>
                  <XAxis dataKey="name" stroke="#a0aec0" />
                  <YAxis yAxisId="left" orientation="left" stroke="#a0aec0" />
                  <Tooltip 
                      contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '0.5rem' }} 
                      itemStyle={{ color: '#e2e8f0' }} 
                      labelStyle={{ color: '#e2e8f0' }}
                      cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}/>
                  <Legend wrapperStyle={{ color: '#cbd5e0' }}/>
                  <Bar yAxisId="left" dataKey="messages" fill="#8b5cf6" name="Messages" barSize={20} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </PermissionGuard>
        
        <PermissionGuard permission="dashboard_view_applicant_analytics">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Applicant Analytics (Last 6 Months)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicantTrendData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#4a5568"/>
                  <XAxis dataKey="name" stroke="#a0aec0" />
                  <YAxis stroke="#a0aec0"/>
                  <Tooltip 
                      contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '0.5rem' }} 
                      itemStyle={{ color: '#e2e8f0' }} 
                      labelStyle={{ color: '#e2e8f0' }}
                      cursor={{stroke: '#f59e0b', strokeWidth: 1, fill: 'rgba(245, 158, 11, 0.1)'}}/>
                  <Legend wrapperStyle={{ color: '#cbd5e0' }}/>
                  <Line
                    type="monotone"
                    dataKey="applicants" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f59e0b', stroke: '#d97706'}}
                    activeDot={{ r: 8, fill: '#f59e0b', stroke: '#d97706' }}
                    name="Applicants"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </PermissionGuard>
      </div>

      <PermissionGuard permission="dashboard_view_user_analytics">
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-md">
          <h3 className="text-lg font-medium text-gray-200 mb-4">User Status Analytics (Last 6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userStatusTrendData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#4a5568"/>
                <XAxis dataKey="name" stroke="#a0aec0" />
                <YAxis stroke="#a0aec0"/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568', borderRadius: '0.5rem' }} 
                  itemStyle={{ color: '#e2e8f0' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  cursor={{stroke: '#10b981', strokeWidth: 1, fill: 'rgba(16, 185, 129, 0.1)'}}/>
                <Legend wrapperStyle={{ color: '#cbd5e0' }}/>
                <Line
                  type="monotone"
                  dataKey="totalUsers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#3b82f6', stroke: '#2563eb'}}
                  activeDot={{ r: 8, fill: '#3b82f6', stroke: '#2563eb' }}
                  name="Total Users"
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10b981', stroke: '#059669'}}
                  activeDot={{ r: 8, fill: '#10b981', stroke: '#059669' }}
                  name="Active Users"
                />
                <Line
                  type="monotone"
                  dataKey="inactiveUsers" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#ef4444', stroke: '#dc2626'}}
                  activeDot={{ r: 8, fill: '#ef4444', stroke: '#dc2626' }}
                  name="Inactive Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
};

export default AdminGraph;