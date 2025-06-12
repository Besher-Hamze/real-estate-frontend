'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TestComponentsPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">اختبار المكونات</h1>

      {/* Button Tests */}
      <Card>
        <CardHeader>
          <CardTitle>الأزرار</CardTitle>
        </CardHeader>
        <CardContent className="space-x-4">
          <Button>افتراضي</Button>
          <Button variant="secondary">ثانوي</Button>
          <Button variant="outline">حدود</Button>
          <Button variant="ghost">شفاف</Button>
          <Button variant="destructive">تدميري</Button>
        </CardContent>
      </Card>

      {/* Input Tests */}
      <Card>
        <CardHeader>
          <CardTitle>حقول الإدخال</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-input">اسم الاختبار</Label>
            <Input id="test-input" placeholder="أدخل النص هنا" />
          </div>

          <div>
            <Label htmlFor="test-textarea">الوصف</Label>
            <Textarea id="test-textarea" placeholder="أدخل وصفاً مفصلاً" />
          </div>
        </CardContent>
      </Card>

      {/* Badge Tests */}
      <Card>
        <CardHeader>
          <CardTitle>الشارات</CardTitle>
        </CardHeader>
        <CardContent className="space-x-2">
          <Badge>افتراضي</Badge>
          <Badge variant="secondary">ثانوي</Badge>
          <Badge variant="outline">حدود</Badge>
          <Badge variant="destructive">تدميري</Badge>
        </CardContent>
      </Card>

      {/* Select Tests */}
      <Card>
        <CardHeader>
          <CardTitle>القوائم المنسدلة</CardTitle>
        </CardHeader>
        <CardContent>
          <Select>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="اختر خياراً" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">الخيار الأول</SelectItem>
              <SelectItem value="option2">الخيار الثاني</SelectItem>
              <SelectItem value="option3">الخيار الثالث</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Checkbox Tests */}
      <Card>
        <CardHeader>
          <CardTitle>مربعات الاختيار</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">أوافق على الشروط والأحكام</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="newsletter" />
            <Label htmlFor="newsletter">اشترك في النشرة الإخبارية</Label>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <p className="text-center text-gray-600">
        جميع المكونات تعمل بشكل صحيح! 🎉
      </p>
    </div>
  );
}
