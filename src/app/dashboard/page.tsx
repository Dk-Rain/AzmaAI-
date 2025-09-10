import { MainPage } from './main-page';
import { Suspense } from 'react';
import DashboardLoading from './loading';

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading/>}>
      <MainPage />
    </Suspense>
  );
}
