import React from 'react';
import '../assets/styles/SectionLoading.css';
import {SectionNameLoad} from './SectionName.jsx';
import {SectionCardLoad} from './SectionCard.jsx';

export default function Section() {
    return (
        <section className="section-loading">
            <SectionNameLoad/>
            <div className="material-loading" draggable="true">
                    <SectionCardLoad/>
                    <SectionCardLoad/>
                    <SectionCardLoad/>
                    <SectionCardLoad/>
                    <SectionCardLoad/>
                    <SectionCardLoad/>
            </div>
        </section>
    );
}