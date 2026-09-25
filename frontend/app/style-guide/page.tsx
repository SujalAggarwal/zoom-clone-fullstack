"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { IconButton } from '@/components/ui/IconButton';
import { Settings, Video, Mic, Users, Calendar } from 'lucide-react';

export default function StyleGuidePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Design System / Style Guide</h1>
        <p className="text-gray-500">Zoom Clone UI Components</p>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <Button variant="primary" size="lg">Primary Large</Button>
          <Button variant="primary">Primary Default</Button>
          <Button variant="primary" size="sm">Primary Small</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Inputs</h2>
        <div className="max-w-sm space-y-4">
          <Input label="Meeting ID or Personal Link Name" placeholder="Enter Meeting ID" />
          <Input label="Your Name" defaultValue="Alex Morgan" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Avatars & Icons</h2>
        <div className="flex gap-6 items-center">
          <Avatar name="Alex Morgan" />
          <Avatar name="Jane Doe" />
          
          <div className="flex gap-2 ml-8">
            <IconButton icon={<Mic size={20} />} />
            <IconButton icon={<Video size={20} />} />
            <IconButton icon={<Users size={20} />} />
            <IconButton icon={<Settings size={20} />} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-zoom-blue text-white p-3 rounded-xl">
                <Video size={24} />
              </div>
              <h3 className="text-lg font-semibold">New Meeting</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">Start an instant meeting</p>
            <Button className="w-full">Start</Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-zoom-blue text-white p-3 rounded-xl">
                <Calendar size={24} />
              </div>
              <h3 className="text-lg font-semibold">Schedule</h3>
            </div>
            <p className="text-gray-500 text-sm mb-4">Plan a future meeting</p>
            <Button variant="secondary" className="w-full">Schedule Meeting</Button>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Modals</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Sample Modal</Button>
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Join Meeting"
        >
          <div className="space-y-4">
            <Input label="Meeting ID" placeholder="e.g. 123-456-789" />
            <Input label="Your Name" defaultValue="Alex Morgan" />
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsModalOpen(false)}>Join</Button>
            </div>
          </div>
        </Modal>
      </section>
    </div>
  );
}
