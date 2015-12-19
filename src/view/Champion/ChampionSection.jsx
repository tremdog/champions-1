import './ChampionSection.scss';
import { RATINGS, GRADES, RANGES, DAMAGE_TYPES, ABILITIES } from '../../data/guides';
import lang from '../../service/lang';
import ChampionGrade from './ChampionGrade.jsx';
import ChampionRating from './ChampionRating.jsx';
import Icon from '../Icon.jsx';
/* eslint-disable no-unused-vars */
import m from 'mithril';
/* eslint-enable no-unused-vars */

const ChampionSection = {
    view(ctrl, args) {
        const {
            title, subtitle, description, note, heavy,
            ranges, damagetypes, abilities,
            rating, grade, gradeAwakened,
            raw, onEdit,
        } = args;
        const elements = [];
        if(onEdit) {
            const editableText = (key) => ({
                'contenteditable': true,
                'class': 'champion-section-textarea',
                'oninput': (event) => onEdit(key, event.target.innerText),
            });
            const editableValue = (value) => value === true? '': value;
            const editableSelect = (list, key, initialValue) => (
                <select
                    class="champion-section-select"
                    onchange={ (event) => onEdit(key, event.target.selectedOptions[ 0 ].value) }
                >
                    <option value="" />
                    {
                        list.map((value) => (
                            <option
                                value={ `${ value }` }
                                selected={ initialValue && value === initialValue }
                            >{
                                value
                            }</option>
                        ))
                    }
                </select>
            );
            const editableSelectAdd = (list, key, array, stringify) => [
                (
                <select
                    key={ Date.now() }
                    class="champion-section-select champion-section-select-item"
                    onchange={ (event) => onEdit(key, [
                        ...array,
                        event.target.selectedOptions[ 0 ].value,
                    ]) }
                >
                    <option value="">+</option>
                    {
                        list.map((value) => (
                            <option
                                value={ value }
                            >{
                                lang.get(stringify(value))
                            }</option>
                        ))
                    }
                </select>
                ),
                array.length? (
                <div class="champion-section-items">
                    {
                        array.map((value, index) => (
                        <span
                            class="champion-section-item"
                            onclick={ () => onEdit(key, array.filter((v, i) => i !== index)) }
                        >
                            <Icon icon="close"/>
                            { lang.get(stringify(value)) }
                        </span>
                        ))
                    }
                </div>
                ): null,
            ];

            elements.push(
                <div class="champion-section-title">
                    { title }
                    { rating !== undefined? (
                        <div style="float:right;">
                            { editableSelect(RATINGS, 'rating', parseInt(rating, 10)) }
                            / 5
                        </div>
                    ): null}
                </div>
            );
            if (grade) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('grade') }:</b>
                        { editableSelect(GRADES, 'grades.normal', grade) }
                    </div>
                );
            }
            if (gradeAwakened) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('awakened') }:</b>
                        { editableSelect(GRADES, 'grades.awakened', gradeAwakened) }
                    </div>
                );
            }
            if (subtitle) {
                elements.push(
                    <div class="champion-section-text">
                        <b {...editableText('subtitle')}>{ editableValue(subtitle) }</b>
                    </div>
                );
            }
            if (description) {
                elements.push(
                    <div class="champion-section-text">
                        <div {...editableText('description')}>{ editableValue(description) }</div>
                    </div>
                );
            }
            if (heavy) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('heavy-attack') }:</b>
                        <span {...editableText('heavy')}>{ editableValue(heavy) }</span>
                    </div>
                );
            }
            if (ranges) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('range') }:</b>
                        { editableSelectAdd(
                            RANGES,
                            'ranges',
                            ranges === true? []: ranges,
                            (range) => `range-${ range }`
                        ) }
                    </div>
                );
            }
            if (damagetypes) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('damage-type') }:</b>
                        { editableSelectAdd(
                            DAMAGE_TYPES,
                            'damagetypes',
                            damagetypes === true? []: damagetypes,
                            (damage) => `damage-${ damage }`
                        ) }
                    </div>
                );
            }
            if (abilities) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('abilities') }:</b>
                        { editableSelectAdd(
                            ABILITIES,
                            'abilities',
                            abilities === true? []: abilities,
                            (ability) => `ability-${ ability }`
                        ) }
                    </div>
                );
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('abilities') }:</b>
                        { abilities.map((ability, index) => (
                        <span class={ `champion-section-ability-${ ability }` }>{
                            (index < abilities.length - 1)?
                                `${ lang.get(`ability-${ ability }`) }, `:
                                lang.get(`ability-${ ability }`)
                            }</span>
                            )) }
                    </div>
                );
            }
            if (note) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('note') }:</b>
                        <span {...editableText('note')}>{ editableValue(note) }</span>
                    </div>
                );
            }
        }
        else {

            elements.push(
                <div class="champion-section-title">
                    { title }
                    { rating !== undefined && (
                        <ChampionRating rating={ rating }/>
                    ) || null}
                </div>
            );
            if (grade) {
                elements.push(
                    <ChampionGrade title="grade" grade={ grade }/>
                );
            }
            if (gradeAwakened) {
                elements.push(
                    <ChampionGrade title="awakened" grade={ gradeAwakened }/>
                );
            }
            if (subtitle) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ subtitle }</b>
                    </div>
                );
            }
            if (description) {
                elements.push(
                    <div class="champion-section-text">
                        <div>{ description }</div>
                    </div>
                );
            }
            if (heavy) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('heavy-attack') }:</b>
                        <span>{ heavy }</span>
                    </div>
                );
            }
            if (ranges && ranges.length) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('range') }:</b>
                        { ranges.map((range, index) => (
                            <span class={ `champion-section-range-${ range }` }>{
                                (index < ranges.length - 1)?
                                    `${ lang.get(`range-${ range }`) }, `:
                                    lang.get(`range-${ range }`)
                            }</span>
                        )) }
                    </div>
                );
            }
            if (damagetypes && damagetypes.length) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('damage-type') }:</b>
                        { damagetypes.map((damage, index) => (
                            <span class={ `champion-section-damage-${ damage }` }>{
                                (index < damagetypes.length - 1)?
                                    `${ lang.get(`damage-${ damage }`) }, `:
                                    lang.get(`damage-${ damage }`)
                            }</span>
                        )) }
                    </div>
                );
            }
            if (abilities && abilities.length) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('abilities') }:</b>
                        { abilities.map((ability, index) => (
                            <span class={ `champion-section-ability-${ ability }` }>{
                            (index < abilities.length - 1)?
                                `${ lang.get(`ability-${ ability }`) }, `:
                                lang.get(`ability-${ ability }`)
                            }</span>
                        )) }
                    </div>
                );
            }
            if (note) {
                elements.push(
                    <div class="champion-section-text">
                        <b>{ lang.get('note') }:</b>
                        <span>{ note }</span>
                    </div>
                );
            }
        }
        if(raw) {
            elements.push(
                <div class="champion-section-raw">
                    { raw }
                </div>
            );
        }
        return (
            <div class="champion-section">
                { elements }
            </div>
        );
    },
};

export default ChampionSection;
