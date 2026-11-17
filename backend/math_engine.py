"""
CampusConnect - Mathematical Analysis Engine (Set Theory & Inclusion-Exclusion Principle)
Strictly adheres to the Discrete Mathematics and Graph Theory (25BSMA10) specification.
"""

def analyze_student_sets(students):
    """
    Computes rigorous Set Theory metrics and Inclusion-Exclusion verification
    for a given iterable of Student model instances or dicts.
    """
    total_u = len(students)
    
    # Extract set memberships using unique USNs or IDs
    set_u = {s.usn if hasattr(s, 'usn') else s['usn'] for s in students}
    
    set_a = set()  # Technical
    set_b = set()  # Sports
    set_c = set()  # Cultural
    
    student_lookup = {}
    for s in students:
        usn = s.usn if hasattr(s, 'usn') else s['usn']
        name = s.full_name if hasattr(s, 'full_name') else s['full_name']
        dept = s.department if hasattr(s, 'department') else s['department']
        sec = s.section if hasattr(s, 'section') else s.get('section', 'A')
        
        student_lookup[usn] = {
            'usn': usn,
            'full_name': name,
            'department': dept,
            'section': sec
        }
        
        t = s.participates_technical if hasattr(s, 'participates_technical') else s.get('participates_technical', False)
        sp = s.participates_sports if hasattr(s, 'participates_sports') else s.get('participates_sports', False)
        c = s.participates_cultural if hasattr(s, 'participates_cultural') else s.get('participates_cultural', False)
        
        if t: set_a.add(usn)
        if sp: set_b.add(usn)
        if c: set_c.add(usn)

    # 1. Cardinalities of individual activity sets
    card_u = len(set_u)
    card_a = len(set_a)
    card_b = len(set_b)
    card_c = len(set_c)

    # 2. Inclusive Intersections
    set_a_cap_b = set_a & set_b
    set_a_cap_c = set_a & set_c
    set_b_cap_c = set_b & set_c
    set_a_cap_b_cap_c = set_a & set_b & set_c

    card_a_cap_b = len(set_a_cap_b)
    card_a_cap_c = len(set_a_cap_c)
    card_b_cap_c = len(set_b_cap_c)
    card_a_cap_b_cap_c = len(set_a_cap_b_cap_c)

    # 3. Principle of Inclusion-Exclusion for 3 sets:
    # |A ∪ B ∪ C| = |A| + |B| + |C| - |A ∩ B| - |A ∩ C| - |B ∩ C| + |A ∩ B ∩ C|
    pie_calculation = card_a + card_b + card_c - card_a_cap_b - card_a_cap_c - card_b_cap_c + card_a_cap_b_cap_c

    # Direct union
    set_union = set_a | set_b | set_c
    card_union = len(set_union)

    # Students participating in none
    set_none = set_u - set_union
    card_none = len(set_none)

    # 4. Seven Mutually Exclusive (Disjoint) Venn Regions
    # Region 1: Technical Only
    region_a_only = set_a - (set_b | set_c)
    # Region 2: Sports Only
    region_b_only = set_b - (set_a | set_c)
    # Region 3: Cultural Only
    region_c_only = set_c - (set_a | set_b)
    
    # Region 4: Technical & Sports ONLY (pairwise minus triple)
    region_ab_only = set_a_cap_b - set_a_cap_b_cap_c
    # Region 5: Technical & Cultural ONLY
    region_ac_only = set_a_cap_c - set_a_cap_b_cap_c
    # Region 6: Sports & Cultural ONLY
    region_bc_only = set_b_cap_c - set_a_cap_b_cap_c
    
    # Region 7: All Three (Technical ∩ Sports ∩ Cultural)
    region_all_three = set_a_cap_b_cap_c

    # Sum of 7 disjoint regions check
    disjoint_sum = (
        len(region_a_only) + len(region_b_only) + len(region_c_only) +
        len(region_ab_only) + len(region_ac_only) + len(region_bc_only) +
        len(region_all_three)
    )

    # 5. Partition Groupings
    exactly_one = len(region_a_only) + len(region_b_only) + len(region_c_only)
    exactly_two = len(region_ab_only) + len(region_ac_only) + len(region_bc_only)
    all_three = len(region_all_three)
    at_least_two = exactly_two + all_three

    # 6. Percentages of Universal Set
    pct = lambda count: round((count / card_u * 100), 2) if card_u > 0 else 0.0

    return {
        'universal_set': {
            'symbol': 'U',
            'label': 'Universal Set (All Registered Students)',
            'count': card_u,
            'percentage': 100.0 if card_u > 0 else 0.0
        },
        'individual_sets': {
            'set_a': {
                'symbol': 'A',
                'label': 'Technical Activities',
                'count': card_a,
                'percentage': pct(card_a)
            },
            'set_b': {
                'symbol': 'B',
                'label': 'Sports Activities',
                'count': card_b,
                'percentage': pct(card_b)
            },
            'set_c': {
                'symbol': 'C',
                'label': 'Cultural Activities',
                'count': card_c,
                'percentage': pct(card_c)
            }
        },
        'inclusive_intersections': {
            'a_cap_b': {
                'symbol': 'A ∩ B',
                'label': 'Technical and Sports Participants',
                'count': card_a_cap_b,
                'percentage': pct(card_a_cap_b)
            },
            'a_cap_c': {
                'symbol': 'A ∩ C',
                'label': 'Technical and Cultural Participants',
                'count': card_a_cap_c,
                'percentage': pct(card_a_cap_c)
            },
            'b_cap_c': {
                'symbol': 'B ∩ C',
                'label': 'Sports and Cultural Participants',
                'count': card_b_cap_c,
                'percentage': pct(card_b_cap_c)
            },
            'a_cap_b_cap_c': {
                'symbol': 'A ∩ B ∩ C',
                'label': 'Participants in All Three Activities',
                'count': card_a_cap_b_cap_c,
                'percentage': pct(card_a_cap_b_cap_c)
            }
        },
        'union_and_complements': {
            'union': {
                'symbol': 'A ∪ B ∪ C',
                'label': 'Unique Activity Participants (At least one)',
                'count': card_union,
                'percentage': pct(card_union),
                'pie_calculated': pie_calculation,
                'disjoint_sum': disjoint_sum,
                'is_verified': (card_union == pie_calculation == disjoint_sum)
            },
            'none': {
                'symbol': 'U - (A ∪ B ∪ C)',
                'label': 'Non-Participants (Outside all sets)',
                'count': card_none,
                'percentage': pct(card_none),
                'is_verified': (card_u == card_union + card_none)
            }
        },
        'venn_regions': {
            'a_only': {
                'id': 'a_only',
                'label': 'Technical Only',
                'symbol': 'A - (B ∪ C)',
                'count': len(region_a_only),
                'percentage': pct(len(region_a_only)),
                'students': [student_lookup[u] for u in sorted(region_a_only)]
            },
            'b_only': {
                'id': 'b_only',
                'label': 'Sports Only',
                'symbol': 'B - (A ∪ C)',
                'count': len(region_b_only),
                'percentage': pct(len(region_b_only)),
                'students': [student_lookup[u] for u in sorted(region_b_only)]
            },
            'c_only': {
                'id': 'c_only',
                'label': 'Cultural Only',
                'symbol': 'C - (A ∪ B)',
                'count': len(region_c_only),
                'percentage': pct(len(region_c_only)),
                'students': [student_lookup[u] for u in sorted(region_c_only)]
            },
            'ab_only': {
                'id': 'ab_only',
                'label': 'Technical & Sports Only',
                'symbol': '(A ∩ B) - C',
                'count': len(region_ab_only),
                'percentage': pct(len(region_ab_only)),
                'students': [student_lookup[u] for u in sorted(region_ab_only)]
            },
            'ac_only': {
                'id': 'ac_only',
                'label': 'Technical & Cultural Only',
                'symbol': '(A ∩ C) - B',
                'count': len(region_ac_only),
                'percentage': pct(len(region_ac_only)),
                'students': [student_lookup[u] for u in sorted(region_ac_only)]
            },
            'bc_only': {
                'id': 'bc_only',
                'label': 'Sports & Cultural Only',
                'symbol': '(B ∩ C) - A',
                'count': len(region_bc_only),
                'percentage': pct(len(region_bc_only)),
                'students': [student_lookup[u] for u in sorted(region_bc_only)]
            },
            'all_three': {
                'id': 'all_three',
                'label': 'All Three (Tech ∩ Sports ∩ Cultural)',
                'symbol': 'A ∩ B ∩ C',
                'count': len(region_all_three),
                'percentage': pct(len(region_all_three)),
                'students': [student_lookup[u] for u in sorted(region_all_three)]
            },
            'none': {
                'id': 'none',
                'label': 'Outside All Sets (None)',
                'symbol': 'U - (A ∪ B ∪ C)',
                'count': card_none,
                'percentage': pct(card_none),
                'students': [student_lookup[u] for u in sorted(set_none)]
            }
        },
        'participation_categories': {
            'exactly_one': {
                'label': 'Exactly One Activity',
                'count': exactly_one,
                'percentage': pct(exactly_one),
                'formula': '|A only| + |B only| + |C only|'
            },
            'exactly_two': {
                'label': 'Exactly Two Activities',
                'count': exactly_two,
                'percentage': pct(exactly_two),
                'formula': '|(A ∩ B) only| + |(A ∩ C) only| + |(B ∩ C) only|'
            },
            'all_three': {
                'label': 'All Three Activities',
                'count': all_three,
                'percentage': pct(all_three),
                'formula': '|A ∩ B ∩ C|'
            },
            'at_least_two': {
                'label': 'At Least Two Activities (Multiple)',
                'count': at_least_two,
                'percentage': pct(at_least_two),
                'formula': 'Exactly Two + All Three'
            },
            'none': {
                'label': 'No Activity Participation',
                'count': card_none,
                'percentage': pct(card_none),
                'formula': '|U| - |A ∪ B ∪ C|'
            }
        },
        'inclusion_exclusion_breakdown': {
            'formula': '|A ∪ B ∪ C| = |A| + |B| + |C| - |A ∩ B| - |A ∩ C| - |B ∩ C| + |A ∩ B ∩ C|',
            'substituted': f"{card_a} + {card_b} + {card_c} - {card_a_cap_b} - {card_a_cap_c} - {card_b_cap_c} + {card_a_cap_b_cap_c} = {card_union}",
            'gross_sum': card_a + card_b + card_c,
            'pairwise_deduction': card_a_cap_b + card_a_cap_c + card_b_cap_c,
            'triple_addition': card_a_cap_b_cap_c,
            'net_unique': card_union,
            'raw_double_counted_difference': (card_a + card_b + card_c) - card_union
        }
    }
