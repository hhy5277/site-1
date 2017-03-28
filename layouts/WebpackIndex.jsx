import React from 'react';
import _ from 'lodash';
import {Link} from 'react-router';
import Moment from 'antwar-helpers/components/Moment';
import Testimonial from '../components/Testimonial';

export default React.createClass({
  displayName: 'ChapterIndex',
  render() {
    const section = this.props.section;

    return (
      <div className="frontpage">
        <div className='front__heading' style={{ height: '20%', minHeight: '20em'}}>
          <div className='front-heading-content-wrapper'>
            <div className='front-header-wrapper'>
              <div className='front-name'>
                <span className='first'>Survive</span>
                <span className='second'>JS</span>
                <span className='first'> - Webpack</span>
              </div>

              <h1 className='front-header'>From apprentice to master</h1>

              <div className='front-button-wrapper'>
                <span className='read-free'>
                  <a href='/webpack/preface'>Read the free version</a>
                </span>

                <span className='buy-or'>or</span>

                <a className='btn btn--buy-main'
                  href='https://leanpub.com/survivejs-webpack'>Become a Webpack master</a>
              </div>
            </div>
          </div>
        </div>

        <div className='front__testimonials'>
          <Testimonial
            text='After weeks failing at configuring webpack, I stumbled upon SurviveJS book while looking for yet another tutorial. Since that day, it has been my go-to resource for every single webpack question I ever had.'
            image={'/assets/img/testimonials/clement.jpg'}
            name='Clément Paris'
            title='Front-end Engineer'
            />

          <Testimonial
            text='Brilliant! A must have if you want to to learn webpack but also if need an updated reference guide. I always use it as a reference guide when I develop. '
            image={'/assets/img/testimonials/andrea.png'}
            name='Andrea Chiumenti'
            title='CEO, Red Software Systems'
            url='https://red.software.systems/'
            />

          <Testimonial
            text='Before I worked through the SurviveJS webpack book, my own webpack config, cobbled together from random code on the Internet, was a mystery to me. Afterwards, I have route-splitting and parallel-loading superpowers.'
            image={'/assets/img/testimonials/gavin.jpg'}
            name='Gavin Doughtie'
            title='Senior Software Engineer, Google'
            url='https://www.google.com/'
            />

          <Testimonial
            text='Webpack is powerful but configuring it can be painful. Same goes with React. There are so many ways of configuring React with asset compilation, minification etc that it is easy to get lost. This book provides practical tips on how to proceed.'
            image={'/assets/img/testimonials/raj.jpg'}
            name='Neeraj Singh'
            title='Founder, Big Binary'
            url='https://www.bigbinary.com/'
            />

          <Testimonial
            text="This guide was a great starter in taming the Wild West of ESNext-era JavaScript development. Its beauty comes from its commitment to not skipping the fundamentals in favor of a fast demo, but making sure you're understanding what you're doing as you bootstrap your next JavaScript-based UI project."
            image={'/assets/img/testimonials/aaron.jpg'}
            name='Aaron Harris'
            title='Software Engineer'
            />

          <Testimonial
            text={<div>
              <p>This guide is a great way to get started with webpack or improve your existing skills.</p>
<p>After a detailed introduction, you'll start working on a webpack project that provides all you need to push your app to production. Highly recommended.</p>
</div>
}
            name='Julien Castelain'
            title='Software Engineer at Liferay'
            />
        </div>

        <div className='post post--front'>
          <section className='post__content'>
            <div dangerouslySetInnerHTML={{__html: require('raw!markdown!./webpack.md')}} />
          </section>
        </div>
      </div>
    );
  }
});
