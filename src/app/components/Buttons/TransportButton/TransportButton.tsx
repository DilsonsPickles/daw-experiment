import React from 'react'
import Icon from '@/app/components/Icon/Icon';
import styles from './TransportButton.module.css';

type TransportButtonProps = {
    code: string;
  };
  

export default function TransportButton({ code }: TransportButtonProps) {

  return (
    <button className={styles.transportButtonContainer}><Icon code={code} size={18} /></button>
  )
}
