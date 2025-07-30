import type { Meta, StoryObj } from '@storybook/react';
import SectionHeader from './SectionHeader';

const meta: Meta<typeof SectionHeader> = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    sub: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: {
    title: '마니또 리포트',
    sub: '너와 나 사이 관계 보고서',
  },
};
