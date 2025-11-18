'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Gift, 
  Plus, 
  Download, 
  TrendingUp, 
  Users, 
  Calendar,
  Clock,
  Target,
  Zap,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Campaign {
  name: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  totalGenerated: number;
  totalUsed: number;
  activeCount: number;
  createdAt: string;
  validFrom: string;
  validTo: string;
  vouchers: Array<{
    id: string;
    code: string;
    usageCount: number;
    usageLimit?: number;
    isActive: boolean;
  }>;
}

interface GeneratedCoupon {
  id: string;
  code: string;
  name: string;
}

export default function CouponGeneratorPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCoupons, setGeneratedCoupons] = useState<GeneratedCoupon[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    userLimit: '',
    validFrom: '',
    validTo: '',
    quantity: '10',
    prefix: 'OISHINE',
    length: '8',
    isActive: true
  });

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/coupon-generator');
      const result = await response.json();
      
      if (result.success) {
        setCampaigns(result.data.campaigns);
      } else {
        toast.error('Failed to fetch coupon campaigns');
      }
    } catch (error) {
      toast.error('Error fetching coupon campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      userLimit: '',
      validFrom: '',
      validTo: '',
      quantity: '10',
      prefix: 'OISHINE',
      length: '8',
      isActive: true
    });
  };

  const handleGenerateCoupons = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/admin/coupon-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          value: parseInt(formData.value),
          quantity: parseInt(formData.quantity),
          length: parseInt(formData.length),
          minOrderAmount: formData.minOrderAmount ? parseInt(formData.minOrderAmount) : undefined,
          maxDiscountAmount: formData.maxDiscountAmount ? parseInt(formData.maxDiscountAmount) : undefined,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
          userLimit: formData.userLimit ? parseInt(formData.userLimit) : undefined
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedCoupons(result.data.coupons);
        setShowResults(true);
        setIsGenerateDialogOpen(false);
        resetForm();
        fetchCampaigns();
        
        toast.success(`Successfully generated ${result.data.coupons.length} coupons`);
        
        if (result.data.failedCoupons.length > 0) {
          toast.warning(`${result.data.failedCoupons.length} coupons failed to generate`);
        }
      } else {
        toast.error(result.error || 'Failed to generate coupons');
      }
    } catch (error) {
      toast.error('Error generating coupons');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadCoupons = () => {
    const csvContent = [
      ['Code', 'Name', 'Type', 'Value', 'Valid From', 'Valid To'],
      ...generatedCoupons.map(coupon => [
        coupon.code,
        coupon.name,
        formData.type,
        formData.type === 'PERCENTAGE' ? `${formData.value}%` : `Rp ${parseInt(formData.value).toLocaleString('id-ID')}`,
        formData.validFrom,
        formData.validTo
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupons-${formData.name}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Back
              </a>
              <div className="flex items-center ml-4">
                <Gift className="w-6 h-6 text-gray-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">Coupon Generator</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Generate bulk coupons and vouchers</p>
          </div>
          <Button 
            onClick={() => setIsGenerateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate Coupons
          </Button>
        </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <div className="grid gap-4">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Gift className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 text-center mb-4">
                    Create your first coupon campaign to start generating vouchers
                  </p>
                  <Button 
                    onClick={() => setIsGenerateDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              campaigns.map((campaign, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {campaign.name}
                          <Badge variant={campaign.activeCount > 0 ? "default" : "secondary"}>
                            {campaign.activeCount > 0 ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {campaign.type === 'PERCENTAGE' ? `${campaign.value}% off` : formatCurrency(campaign.value)} discount
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(campaign.validFrom)} - {formatDate(campaign.validTo)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Generated</p>
                          <p className="text-lg font-semibold">{campaign.totalGenerated}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Used</p>
                          <p className="text-lg font-semibold">{campaign.totalUsed}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Active</p>
                          <p className="text-lg font-semibold">{campaign.activeCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">Usage Rate</p>
                          <p className="text-lg font-semibold">
                            {campaign.totalGenerated > 0 
                              ? Math.round((campaign.totalUsed / campaign.totalGenerated) * 100) 
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Recent Coupons</h4>
                      <div className="flex flex-wrap gap-2">
                        {campaign.vouchers.slice(0, 5).map((voucher) => (
                          <Badge 
                            key={voucher.id} 
                            variant={voucher.isActive ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => copyToClipboard(voucher.code)}
                          >
                            {voucher.code}
                            {voucher.usageLimit && ` (${voucher.usageCount}/${voucher.usageLimit})`}
                          </Badge>
                        ))}
                        {campaign.vouchers.length > 5 && (
                          <Badge variant="outline">
                            +{campaign.vouchers.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setFormData({
                ...formData,
                name: 'Flash Sale 20%',
                description: 'Limited time flash sale discount',
                type: 'PERCENTAGE',
                value: '20',
                quantity: '50',
                prefix: 'FLASH',
                usageLimit: '1'
              });
              setIsGenerateDialogOpen(true);
            }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Flash Sale</CardTitle>
                </div>
                <CardDescription>20% percentage discount for limited time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>• 20% off all orders</p>
                  <p>• Single use per customer</p>
                  <p>• Limited quantity</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setFormData({
                ...formData,
                name: 'Free Delivery',
                description: 'Free shipping on minimum order',
                type: 'FIXED',
                value: '15000',
                minOrderAmount: '50000',
                quantity: '100',
                prefix: 'SHIP',
                usageLimit: '3'
              });
              setIsGenerateDialogOpen(true);
            }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Free Delivery</CardTitle>
                </div>
                <CardDescription>Free shipping voucher for minimum orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>• Rp 15,000 delivery discount</p>
                  <p>• Min. Rp 50,000 order</p>
                  <p>• 3 uses per customer</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setFormData({
                ...formData,
                name: 'New Customer',
                description: 'Special discount for new customers',
                type: 'PERCENTAGE',
                value: '15',
                quantity: '200',
                prefix: 'NEW',
                userLimit: '1'
              });
              setIsGenerateDialogOpen(true);
            }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">New Customer</CardTitle>
                </div>
                <CardDescription>Welcome discount for new customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p>• 15% first order discount</p>
                  <p>• New customers only</p>
                  <p>• Single use per customer</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Coupons Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Coupons</DialogTitle>
            <DialogDescription>
              Create bulk coupons for your marketing campaign
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Flash Sale 20%"
                />
              </div>
              <div>
                <Label htmlFor="type">Discount Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (IDR)</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the campaign"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">
                  Discount Value ({formData.type === 'PERCENTAGE' ? '%' : 'IDR'})
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'PERCENTAGE' ? '20' : '15000'}
                />
              </div>
              <div>
                <Label htmlFor="minOrderAmount">Minimum Order (IDR, Optional)</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="50000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usageLimit">Usage Limit per Coupon (Optional)</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="userLimit">Usage Limit per Customer (Optional)</Label>
                <Input
                  id="userLimit"
                  type="number"
                  value={formData.userLimit}
                  onChange={(e) => setFormData({ ...formData, userLimit: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>

            {formData.type === 'PERCENTAGE' && (
              <div>
                <Label htmlFor="maxDiscountAmount">Maximum Discount (IDR, Optional)</Label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                  placeholder="20000"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="validTo">Valid To</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="10"
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <Label htmlFor="prefix">Code Prefix</Label>
                <Input
                  id="prefix"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                  placeholder="OISHINE"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="length">Code Length</Label>
                <Input
                  id="length"
                  type="number"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  placeholder="8"
                  min="6"
                  max="12"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCoupons} 
              disabled={isGenerating || !formData.name || !formData.value || !formData.validFrom || !formData.validTo}
            >
              {isGenerating ? 'Generating...' : `Generate ${formData.quantity} Coupons`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generation Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Coupons Generated Successfully!</DialogTitle>
            <DialogDescription>
              {generatedCoupons.length} coupons have been generated for your campaign
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Click on any coupon code to copy it to clipboard
              </p>
              <Button onClick={downloadCoupons} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                {generatedCoupons.map((coupon) => (
                  <div 
                    key={coupon.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => copyToClipboard(coupon.code)}
                  >
                    <div>
                      <p className="font-mono font-semibold">{coupon.code}</p>
                      <p className="text-xs text-gray-500">{coupon.name}</p>
                    </div>
                    <Copy className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResults(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}