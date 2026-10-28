import { InformationPage } from '@/components/store/InformationPage';

export const metadata = { title: 'Delivery information' };

export default function Page() {
  return <InformationPage info="shipping" />;
}
