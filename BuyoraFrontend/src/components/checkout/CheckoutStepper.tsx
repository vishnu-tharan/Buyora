'use client';

import { cn } from '@/lib/utils';
import { useCheckoutStore } from '@/stores';
import { Check } from 'lucide-react';

interface CheckoutStepperProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Contact & Shipping' },
  { id: 2, name: 'Shipping Method' },
  { id: 3, name: 'Payment Method' },
  { id: 4, name: 'Review' },
  { id: 5, name: 'Payment' },
] as const;

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const setStep = useCheckoutStore((state) => state.setStep);

  return (
    <nav aria-label="Progress">
      {/* Mobile Stepper */}
      <div className="md:hidden">
        <p className="mb-2 text-sm font-medium text-gray-500">
          Step {currentStep} of {steps.length}
        </p>
        <div className="flex h-2 w-full items-center overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-base font-semibold text-gray-900">
          {steps.find((s) => s.id === currentStep)?.name}
        </p>
      </div>

      {/* Desktop Stepper */}
      <ol className="hidden items-center md:flex">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              'relative pr-8 sm:pr-20',
              stepIdx === steps.length - 1 ? 'pr-0 sm:pr-0' : ''
            )}
          >
            {step.id < currentStep ? (
              <div className="flex items-center">
                <button
                  type="button"
                  disabled={currentStep === 5}
                  onClick={() => setStep(step.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800 focus:outline-none"
                >
                  <Check className="h-5 w-5" />
                  <span className="sr-only">{step.name}</span>
                </button>
                <span className="ml-3 hidden text-sm font-medium text-gray-900 lg:block">
                  {step.name}
                </span>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 right-0 -z-10 h-[2px] w-full bg-gray-300" />
                )}
              </div>
            ) : step.id === currentStep ? (
              <div className="flex items-center">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white"
                  aria-current="step"
                >
                  <span className="text-sm font-semibold text-black">{step.id}</span>
                </div>
                <span className="ml-3 hidden text-sm font-bold text-gray-900 lg:block">
                  {step.name}
                </span>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 right-0 -z-10 h-[2px] w-full bg-gray-300" />
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                  <span className="text-sm font-semibold text-gray-500">{step.id}</span>
                </div>
                <span className="ml-3 hidden text-sm font-medium text-gray-500 lg:block">
                  {step.name}
                </span>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 right-0 -z-10 h-[2px] w-full bg-gray-300" />
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
