'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, TrendingUp, Gift, Crown, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface LoyaltyWidgetProps {
  userId?: string
  sessionId?: string
}

export default function LoyaltyWidget({ userId, sessionId }: LoyaltyWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loyaltyData, setLoyaltyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId || sessionId) {
      loadLoyaltyData()
    }
  }, [userId, sessionId])

  const loadLoyaltyData = async () => {
    try {
      const id = userId || sessionId
      const response = await fetch(`/api/loyalty?${userId ? 'userId' : 'sessionId'}=${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setLoyaltyData(data.data)
        }
      }
    } catch (error) {
      console.error('Error loading loyalty data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return <Crown className="h-5 w-5 text-purple-500" />
      case 'GOLD': return <Crown className="h-5 w-5 text-yellow-500" />
      case 'SILVER': return <Award className="h-5 w-5 text-gray-400" />
      default: return <Award className="h-5 w-5 text-orange-600" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'from-purple-500 to-pink-500'
      case 'GOLD': return 'from-yellow-500 to-orange-500'
      case 'SILVER': return 'from-gray-400 to-gray-600'
      default: return 'from-orange-500 to-red-500'
    }
  }

  if (!loyaltyData || isLoading) return null

  const progressToNextTier = loyaltyData.progress.nextTier ? 
    Math.min(
      100,
      (loyaltyData.progress.totalSpent / loyaltyData.progress.nextTierRequirements.minSpent) * 100
    ) : 100

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed top-24 right-6 z-40 bg-gradient-to-r ${getTierColor(loyaltyData.tier)} text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-all`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        {getTierIcon(loyaltyData.tier)}
        <span className="font-bold">{loyaltyData.points} pts</span>
        <Star className="h-4 w-4" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getTierIcon(loyaltyData.tier)}
                  <div>
                    <h3 className="text-xl font-bold">Loyalty Rewards</h3>
                    <Badge className={`bg-gradient-to-r ${getTierColor(loyaltyData.tier)} text-white`}>
                      {loyaltyData.tier}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Points Balance */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-1">Your Points</p>
                  <p className="text-4xl font-bold text-red-600">{loyaltyData.points}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    = Rp {(loyaltyData.points * 100).toLocaleString('id-ID')} discount
                  </p>
                </div>
              </div>

              {/* Tier Benefits */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Your Benefits</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Points Multiplier</span>
                    <span className="font-bold text-red-600">
                      {loyaltyData.benefits.pointsMultiplier}x
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Member Discount</span>
                    <span className="font-bold text-red-600">
                      {loyaltyData.benefits.discountPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Free Delivery Min</span>
                    <span className="font-bold text-red-600">
                      {loyaltyData.benefits.freeDeliveryMin === 0 ? 'Always Free!' : 
                       `Rp ${loyaltyData.benefits.freeDeliveryMin.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {loyaltyData.progress.nextTier && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">
                    Progress to {loyaltyData.progress.nextTier}
                  </h4>
                  <Progress value={progressToNextTier} className="mb-2" />
                  <div className="text-sm text-gray-600">
                    <p>
                      Spend Rp {(loyaltyData.progress.nextTierRequirements.minSpent - loyaltyData.progress.totalSpent).toLocaleString('id-ID')} more
                    </p>
                    <p>
                      {loyaltyData.progress.nextTierRequirements.minOrders - loyaltyData.progress.totalOrders} more orders
                    </p>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold mb-3">Recent Activity</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {loyaltyData.history.slice(0, 5).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
