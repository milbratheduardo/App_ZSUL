import { View, Text } from 'react-native'
import React from 'react'
import CustomButton from '@/components/CustomButton'
import { StripeProvider } from "@stripe/stripe-react-native"
import Payment from '@/components/Payment'

const teste_checkout = () => {
  return (
    <View>
      <StripeProvider publishableKey='pk_test_51Q7MGVKiDdI5fpVwaqUUDHc6FjYndB61fm2I0eaarHFGqoBaYMcxnwfmndqwa8xu4wrTB0FOc9o1HFLF4k5yQ8Rm00PBKaJiZ6'>
        <Payment />
      </StripeProvider>
    </View>
  )
}

export default teste_checkout